import type { Server as HttpServer, IncomingMessage } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { z } from "zod";
import { createAiEvaluator } from "../../providers/ai/index.js";
import { createSpeechToTextProvider } from "../../providers/stt/index.js";
import { InterviewService } from "../interviews/interviewService.js";

const ClientMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("ping") }),
  z.object({ type: z.literal("start") }),
  z.object({ type: z.literal("answer_partial"), questionId: z.string().uuid(), text: z.string().max(5000) }),
  z.object({ type: z.literal("answer_final"), questionId: z.string().uuid(), text: z.string().min(1).max(5000) }),
  z.object({
    type: z.literal("audio_final"),
    questionId: z.string().uuid(),
    audioBase64: z.string().min(1),
    mimeType: z.string().optional()
  }),
  z.object({ type: z.literal("skip_question"), questionId: z.string().uuid() }),
  z.object({ type: z.literal("submit") })
]);

type LiveState = {
  sessionId: string;
  currentQuestionIndex: number;
  answeredQuestionIds: Set<string>;
};

function send(socket: WebSocket, type: string, payload: Record<string, unknown> = {}) {
  socket.send(JSON.stringify({ type, ...payload }));
}

function parseSessionId(request: IncomingMessage) {
  const url = new URL(request.url ?? "", "http://localhost");
  const match = url.pathname.match(/^\/interviews\/([^/]+)\/live$/);
  return match?.[1];
}

function nextUnansweredIndex(questions: Array<{ id: string }>, answeredQuestionIds: Set<string>, fallbackIndex: number) {
  const unansweredIndex = questions.findIndex((question) => !answeredQuestionIds.has(question.id));
  return unansweredIndex >= 0 ? unansweredIndex : Math.min(fallbackIndex, questions.length - 1);
}

export function attachLiveInterviewSocket(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });
  const interviewService = new InterviewService(createAiEvaluator());
  const speechToText = createSpeechToTextProvider();

  server.on("upgrade", (request, socket, head) => {
    const sessionId = parseSessionId(request);
    if (!sessionId) {
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request, sessionId);
    });
  });

  wss.on("connection", async (socket: WebSocket, _request: IncomingMessage, sessionId: string) => {
    const state: LiveState = {
      sessionId,
      currentQuestionIndex: 0,
      answeredQuestionIds: new Set()
    };

    async function loadAndSendState() {
      const live = await interviewService.getLiveSession(state.sessionId);
      live.answers.forEach((answer) => state.answeredQuestionIds.add(answer.questionId));
      state.currentQuestionIndex = nextUnansweredIndex(live.questions, state.answeredQuestionIds, state.currentQuestionIndex);

      send(socket, "session_state", {
        session: live.session,
        questionCount: live.questions.length,
        answeredCount: state.answeredQuestionIds.size,
        questions: live.questions
      });

      const currentQuestion = live.questions[state.currentQuestionIndex];
      if (currentQuestion) {
        send(socket, "question", {
          question: currentQuestion,
          questionIndex: state.currentQuestionIndex,
          questionCount: live.questions.length
        });
      }
    }

    async function advanceOrSubmit() {
      const live = await interviewService.getLiveSession(state.sessionId);
      live.answers.forEach((answer) => state.answeredQuestionIds.add(answer.questionId));

      const nextIndex = live.questions.findIndex((question) => !state.answeredQuestionIds.has(question.id));
      if (nextIndex >= 0) {
        state.currentQuestionIndex = nextIndex;
        send(socket, "question", {
          question: live.questions[nextIndex],
          questionIndex: nextIndex,
          questionCount: live.questions.length
        });
        return;
      }

      send(socket, "evaluating", { sessionId: state.sessionId });
      const submitted = await interviewService.submitInterview(state.sessionId);
      const feedback = await interviewService.getFeedback(state.sessionId);
      send(socket, "completed", {
        sessionId: state.sessionId,
        feedbackReportId: submitted.feedbackReportId,
        feedback: feedback.feedback
      });
    }

    try {
      await interviewService.startInterview(state.sessionId);
      await interviewService.logLiveEvent(state.sessionId, "socket_connected", {});
      await loadAndSendState();
    } catch (error) {
      send(socket, "error", { message: error instanceof Error ? error.message : "Failed to start live interview" });
      socket.close(1011);
      return;
    }

    socket.on("message", async (data) => {
      try {
        const parsed = ClientMessageSchema.parse(JSON.parse(data.toString()));

        if (parsed.type === "ping") {
          send(socket, "pong");
          return;
        }

        if (parsed.type === "start") {
          await interviewService.logLiveEvent(state.sessionId, "client_start", {});
          await loadAndSendState();
          return;
        }

        if (parsed.type === "answer_partial") {
          await interviewService.logLiveEvent(
            state.sessionId,
            "answer_partial",
            { text: parsed.text.slice(0, 500) },
            parsed.questionId
          );
          send(socket, "transcript_partial", { questionId: parsed.questionId, text: parsed.text });
          return;
        }

        if (parsed.type === "answer_final") {
          await interviewService.saveLiveAnswer(state.sessionId, parsed.questionId, parsed.text);
          await interviewService.logLiveEvent(state.sessionId, "answer_final", { text: parsed.text }, parsed.questionId);
          state.answeredQuestionIds.add(parsed.questionId);
          send(socket, "answer_saved", { questionId: parsed.questionId, transcript: parsed.text });
          await advanceOrSubmit();
          return;
        }

        if (parsed.type === "audio_final") {
          send(socket, "transcribing", { questionId: parsed.questionId });
          const transcription = await speechToText.transcribe({
            sessionId: state.sessionId,
            questionId: parsed.questionId,
            audioBase64: parsed.audioBase64,
            mimeType: parsed.mimeType
          });
          await interviewService.saveLiveAnswer(state.sessionId, parsed.questionId, transcription.transcript);
          await interviewService.logLiveEvent(
            state.sessionId,
            "audio_final",
            { mimeType: parsed.mimeType, transcript: transcription.transcript, confidence: transcription.confidence },
            parsed.questionId
          );
          state.answeredQuestionIds.add(parsed.questionId);
          send(socket, "transcript_final", {
            questionId: parsed.questionId,
            text: transcription.transcript,
            confidence: transcription.confidence
          });
          await advanceOrSubmit();
          return;
        }

        if (parsed.type === "skip_question") {
          await interviewService.saveLiveAnswer(state.sessionId, parsed.questionId, "Skipped during live demo.");
          await interviewService.logLiveEvent(state.sessionId, "skip_question", {}, parsed.questionId);
          state.answeredQuestionIds.add(parsed.questionId);
          send(socket, "answer_saved", { questionId: parsed.questionId, transcript: "Skipped during live demo." });
          await advanceOrSubmit();
          return;
        }

        if (parsed.type === "submit") {
          await advanceOrSubmit();
        }
      } catch (error) {
        send(socket, "error", {
          message: error instanceof Error ? error.message : "Invalid live interview message"
        });
      }
    });

    socket.on("close", async () => {
      try {
        await interviewService.logLiveEvent(state.sessionId, "socket_disconnected", {});
      } catch (error) {
        console.warn("Failed to log live socket disconnect", error);
      }
    });
  });

  return wss;
}
