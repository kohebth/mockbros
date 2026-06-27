import type { SpeechToTextProvider, TranscribeAudioInput, TranscribeAudioOutput } from "./types.js";

export class HttpSpeechToTextProvider implements SpeechToTextProvider {
  constructor(private readonly serviceUrl: string) {}

  async transcribe(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
    const response = await fetch(`${this.serviceUrl.replace(/\/$/, "")}/transcribe`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error(`STT service returned ${response.status}`);
    }

    return (await response.json()) as TranscribeAudioOutput;
  }
}
