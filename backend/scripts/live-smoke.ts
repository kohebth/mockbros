import WebSocket from "ws";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const wsBaseUrl = baseUrl.replace(/^http/, "ws");

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
      userName: "Live Demo Candidate",
      userEmail: "live-demo@mockbros.test"
    })
  });

  const socket = new WebSocket(`${wsBaseUrl}/interviews/${session.sessionId}/live`);
  const answered = new Set<string>();

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Live smoke timed out")), 15000);

    socket.on("message", (raw) => {
      const message = JSON.parse(raw.toString());
      console.log(message);

      if (message.type === "question" && !answered.has(message.question.id)) {
        answered.add(message.question.id);
        socket.send(
          JSON.stringify({
            type: "answer_final",
            questionId: message.question.id,
            text:
              "I would explain the situation, my action, the tradeoff I made because of user impact, " +
              "and the result the team achieved. I would also share what I learned."
          })
        );
      }

      if (message.type === "completed") {
        clearTimeout(timeout);
        socket.close();
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
