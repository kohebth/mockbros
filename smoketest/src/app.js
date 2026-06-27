const query = new URLSearchParams(window.location.search);
const defaultBackendUrl = query.get("backendUrl") ?? "http://localhost:3000";
const recordMs = Number(query.get("recordMs") ?? 900);

const elements = {
  backendUrl: document.querySelector("#backendUrl"),
  startSession: document.querySelector("#startSession"),
  recordAnswer: document.querySelector("#recordAnswer"),
  connectionStatus: document.querySelector("#connectionStatus"),
  questionStatus: document.querySelector("#questionStatus"),
  audioStatus: document.querySelector("#audioStatus"),
  resultStatus: document.querySelector("#resultStatus"),
  questionText: document.querySelector("#questionText"),
  eventLog: document.querySelector("#eventLog"),
  clearEvents: document.querySelector("#clearEvents")
};

const state = {
  socket: null,
  currentQuestion: null,
  recording: false
};

elements.backendUrl.value = defaultBackendUrl;

function setStatus(key, value) {
  elements[key].value = value;
  elements[key].textContent = value;
}

function logEvent(type, payload = {}) {
  const item = document.createElement("li");
  item.textContent = `${new Date().toISOString()} ${type} ${JSON.stringify(payload)}`;
  elements.eventLog.prepend(item);
}

function apiBaseUrl() {
  return elements.backendUrl.value.replace(/\/$/, "");
}

function wsBaseUrl() {
  return apiBaseUrl().replace(/^http/, "ws");
}

async function request(path, init) {
  const response = await fetch(`${apiBaseUrl()}${path}`, init);
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed with ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

async function createSession() {
  const templates = await request("/interview-templates");
  const templateId = templates.templates?.[0]?.id;
  if (!templateId) {
    throw new Error("No interview templates returned by backend");
  }

  return request("/interviews", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      templateId,
      userName: "Playwright Audio Candidate",
      userEmail: `playwright-audio-${Date.now()}@mockbros.test`
    })
  });
}

function connectLiveSocket(sessionId) {
  if (state.socket) {
    state.socket.close();
  }

  const socket = new WebSocket(`${wsBaseUrl()}/interviews/${sessionId}/live`);
  state.socket = socket;
  setStatus("connectionStatus", "Connecting");

  socket.addEventListener("open", () => {
    setStatus("connectionStatus", "Connected");
    logEvent("socket_open", { sessionId });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    logEvent(message.type, message);

    if (message.type === "question") {
      state.currentQuestion = message.question;
      elements.questionText.textContent = message.question.questionText ?? message.question.prompt ?? message.question.text ?? message.question.title;
      setStatus("questionStatus", `Question ${message.questionIndex + 1} of ${message.questionCount}`);
      elements.recordAnswer.disabled = false;
    }

    if (message.type === "transcribing") {
      setStatus("audioStatus", "Transcribing");
      elements.recordAnswer.disabled = true;
    }

    if (message.type === "transcript_final") {
      setStatus("audioStatus", `Transcript: ${message.text}`);
      setStatus("resultStatus", "Transcript received");
    }

    if (message.type === "completed") {
      setStatus("connectionStatus", "Completed");
      setStatus("resultStatus", "Interview completed");
      elements.recordAnswer.disabled = true;
    }

    if (message.type === "error") {
      setStatus("resultStatus", `Error: ${message.message}`);
      elements.recordAnswer.disabled = !state.currentQuestion;
    }
  });

  socket.addEventListener("close", () => {
    if (elements.connectionStatus.value !== "Completed") {
      setStatus("connectionStatus", "Closed");
    }
  });

  socket.addEventListener("error", () => {
    setStatus("connectionStatus", "Socket error");
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(blob);
  });
}

async function recordAudioBlob() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks = [];
  const recorder = new MediaRecorder(stream);

  return new Promise((resolve, reject) => {
    const stopTracks = () => stream.getTracks().forEach((track) => track.stop());

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    });

    recorder.addEventListener("stop", () => {
      stopTracks();
      resolve(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
    });

    recorder.addEventListener("error", (event) => {
      stopTracks();
      reject(event.error);
    });

    recorder.start();
    window.setTimeout(() => recorder.stop(), recordMs);
  });
}

async function startSession() {
  elements.startSession.disabled = true;
  elements.recordAnswer.disabled = true;
  setStatus("connectionStatus", "Creating session");
  setStatus("resultStatus", "Creating session");

  try {
    const session = await createSession();
    setStatus("resultStatus", `Session ${session.sessionId}`);
    connectLiveSocket(session.sessionId);
  } catch (error) {
    setStatus("connectionStatus", "Session failed");
    setStatus("resultStatus", `Error: ${error.message}`);
    elements.startSession.disabled = false;
  }
}

async function recordAndSendAnswer() {
  if (!state.currentQuestion || !state.socket || state.socket.readyState !== WebSocket.OPEN || state.recording) {
    return;
  }

  state.recording = true;
  elements.recordAnswer.disabled = true;
  setStatus("audioStatus", "Recording");

  try {
    const blob = await recordAudioBlob();
    const audioBase64 = await blobToBase64(blob);
    setStatus("audioStatus", `Sending ${blob.size} bytes`);
    const payload = {
      type: "audio_final",
      questionId: state.currentQuestion.id,
      audioBase64,
      mimeType: blob.type || "audio/webm"
    };
    logEvent("audio_final", {
      questionId: payload.questionId,
      mimeType: payload.mimeType,
      bytes: blob.size
    });
    state.socket.send(JSON.stringify(payload));
  } catch (error) {
    setStatus("audioStatus", `Microphone error: ${error.message}`);
    elements.recordAnswer.disabled = false;
  } finally {
    state.recording = false;
  }
}

elements.startSession.addEventListener("click", () => void startSession());
elements.recordAnswer.addEventListener("click", () => void recordAndSendAnswer());
elements.clearEvents.addEventListener("click", () => {
  elements.eventLog.replaceChildren();
});
