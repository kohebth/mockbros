export type TranscribeAudioInput = {
  sessionId: string;
  questionId: string;
  audioBase64: string;
  mimeType?: string;
};

export type TranscribeAudioOutput = {
  transcript: string;
  confidence?: number;
};

export interface SpeechToTextProvider {
  transcribe(input: TranscribeAudioInput): Promise<TranscribeAudioOutput>;
}
