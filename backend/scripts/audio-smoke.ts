import WebSocket from "ws";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const wsBaseUrl = baseUrl.replace(/^http/, "ws");
const sampleAudioBase64 = Buffer.from("mockbros demo audio bytes").toString("base64");

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${path}`, init);
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed with ${response.status}: ${await response.text()}`);
  }
  return response.json() as Promise<any>;
}

async function main() {
  const templates = await request("/interview-templates");
  const templateId = templates.templates[0].id;
  const session = await request("/interviews", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      templateId,
      userName: "Audio Demo Candidate",
      userEmail: "audio-demo@mockbros.test"
    })
  });

  const socket = new WebSocket(`${wsBaseUrl}/interviews/${session.sessionId}/live`);
  const answered = new Set<string>();
  let transcriptEvents = 0;

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Audio smoke timed out")), 15000);

    socket.on("message", (raw) => {
      const message = JSON.parse(raw.toString());
      console.log(message);

      if (message.type === "question" && !answered.has(message.question.id)) {
        answered.add(message.question.id);
        socket.send(
          JSON.stringify({
            type: "audio_final",
            questionId: message.question.id,
            audioBase64: sampleAudioBase64,
            mimeType: "audio/webm"
          })
        );
      }

      if (message.type === "transcript_final") {
        transcriptEvents += 1;
      }

      if (message.type === "completed") {
        clearTimeout(timeout);
        socket.close();
        if (transcriptEvents === 0) {
          reject(new Error("Expected at least one transcript_final event"));
          return;
        }
        resolve();
      }

      if (message.type === "error") {
        clearTimeout(timeout);
        reject(new Error(message.message));
      }
    });

    socket.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
