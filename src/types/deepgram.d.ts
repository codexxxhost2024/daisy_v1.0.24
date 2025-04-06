
declare namespace Deepgram {
  interface TranscriptionResult {
    results: {
      channels: Array<{
        alternatives: Array<{
          transcript: string;
          confidence: number;
          words: Array<{
            word: string;
            start: number;
            end: number;
            confidence: number;
            punctuated_word?: string;
            speaker?: number;
          }>;
        }>;
      }>;
      utterances?: Array<{
        start: number;
        end: number;
        confidence: number;
        channel: number;
        transcript: string;
        id: string;
        words: Array<{
          word: string;
          start: number;
          end: number;
          confidence: number;
        }>;
      }>;
      summary?: {
        result?: string;
        short?: string;
      };
      topics?: Array<{
        topics: Array<{
          topic: string;
          confidence: number;
        }>;
      }>;
    };
  }

  interface TranscriptionOptions {
    model?: string;
    language?: string;
    version?: string;
    punctuate?: boolean;
    profanity_filter?: boolean;
    redact?: string[] | boolean;
    diarize?: boolean;
    multichannel?: boolean;
    alternatives?: number;
    numerals?: boolean;
    smart_format?: boolean;
    keywords?: string[];
    search?: string[];
    replace?: Array<{ search: string; replace: string }>;
    summarize?: boolean;
    detect_topics?: boolean;
    utterances?: boolean;
  }
}

export = Deepgram;
