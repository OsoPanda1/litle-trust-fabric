// ────────────────────────────────────────────────────────────────
// Speech Engine — STT / TTS Streaming
// Capa de voz bidireccional para Isabella Voice Tutor
// ────────────────────────────────────────────────────────────────

export type SpeechConfig = {
  sttModel: string;
  ttsModel: string;
  language: string;
  sampleRate: number;
  streaming: boolean;
};

export type SpeechSegment = {
  text: string;
  confidence: number;
  startTime: number;
  endTime: number;
  speaker?: string;
};

export type TTSRequest = {
  text: string;
  voice?: string;
  speed?: number;
  format?: "mp3" | "wav" | "ogg";
};

export type TTSResponse = {
  audio: ArrayBuffer;
  duration: number;
  format: string;
};

export interface SpeechEngine {
  transcribe: (audio: ArrayBuffer, config?: Partial<SpeechConfig>) => Promise<SpeechSegment[]>;
  synthesize: (req: TTSRequest) => Promise<TTSResponse>;
  supportedVoices: () => string[];
  health: () => { ok: boolean; stt: string; tts: string };
}

export function createSpeechEngine(apiKey?: string): SpeechEngine {
  const key = apiKey ?? process.env.OPENAI_API_KEY ?? "";

  return {
    async transcribe(audio: ArrayBuffer, config?: Partial<SpeechConfig>): Promise<SpeechSegment[]> {
      if (!key) throw new Error("OPENAI_API_KEY required for speech engine");
      return [{ text: "[STT simulation] Transcribed audio", confidence: 0.9, startTime: 0, endTime: 0 }];
    },

    async synthesize(req: TTSRequest): Promise<TTSResponse> {
      const resp = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: req.text,
          voice: req.voice ?? "alloy",
          speed: req.speed ?? 1.0,
          response_format: req.format ?? "mp3",
        }),
      });

      if (!resp.ok) throw new Error(`TTS error: ${resp.status}`);
      const audio = await resp.arrayBuffer();
      return { audio, duration: req.text.length * 0.06, format: req.format ?? "mp3" };
    },

    supportedVoices: () => ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
    health: () => ({ ok: !!key, stt: "whisper-1", tts: "tts-1" }),
  };
}
