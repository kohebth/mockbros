import type { SpeechToTextProvider, TranscribeAudioInput, TranscribeAudioOutput } from "./types.js";

export class MockSpeechToTextProvider implements SpeechToTextProvider {
  async transcribe(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
    const audioBytes = Math.floor((input.audioBase64.length * 3) / 4);

    return {
      transcript:
        "This is a mock live transcript generated from the submitted audio. " +
        `The backend received about ${audioBytes} bytes for this answer. ` +
        "For the demo, replace STT_PROVIDER with an HTTP speech service to use real transcription.",
      confidence: 0.75
    };
  }
}
