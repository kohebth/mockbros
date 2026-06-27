import { config } from "../../config.js";
import { HttpSpeechToTextProvider } from "./httpSpeechToTextProvider.js";
import { MockSpeechToTextProvider } from "./mockSpeechToTextProvider.js";
import type { SpeechToTextProvider } from "./types.js";

export function createSpeechToTextProvider(): SpeechToTextProvider {
  const mock = new MockSpeechToTextProvider();

  if (config.STT_PROVIDER !== "http") {
    return mock;
  }

  const http = new HttpSpeechToTextProvider(config.STT_SERVICE_URL);

  return {
    async transcribe(input) {
      try {
        return await http.transcribe(input);
      } catch (error) {
        console.warn("STT HTTP provider failed; falling back to mock transcription", error);
        return mock.transcribe(input);
      }
    }
  };
}
