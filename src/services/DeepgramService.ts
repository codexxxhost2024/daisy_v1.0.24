// This is a production-ready service for Deepgram API integration
// In a real app, API keys would be stored in environment variables

// Access the API key from environment variables (Vite specific)
const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

export interface DeepgramResult {
  transcript: string;
  confidence: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export const transcribeAudio = async (audioBlob: Blob): Promise<DeepgramResult> => {
  if (!DEEPGRAM_API_KEY) {
    console.error('Deepgram API Key is missing. Please check your .env.local file.');
    throw new Error('Deepgram API Key is not configured.');
  }

  try {
    console.log('Transcribing audio with size:', audioBlob.size, 'bytes, type:', audioBlob.type, 'using Deepgram API');

    // Send the raw Blob data directly with the correct Content-Type
    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': audioBlob.type // Set Content-Type to the Blob's actual MIME type
      },
      body: audioBlob // Send the Blob directly
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Deepgram API Error Response:', errorBody);
      throw new Error(`Deepgram API error: ${response.status} - ${response.statusText}. ${errorBody}`);
    }

    const data = await response.json();

    // Check if results are available
    if (!data.results?.channels?.[0]?.alternatives?.[0]) {
        console.error('Deepgram response structure unexpected:', data);
        throw new Error('Unexpected response structure from Deepgram API.');
    }

    const alternative = data.results.channels[0].alternatives[0];

    return {
      transcript: alternative.transcript || '', // Ensure transcript is always a string
      confidence: alternative.confidence || 0, // Ensure confidence is always a number
      words: alternative.words || [] // Ensure words is always an array
    };

  } catch (error) { // Removed ': any'
    console.error('Deepgram transcription error:', error);
    // Provide a more specific error message if possible
    let errorMessage = 'Unknown error during transcription.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    // You could add more specific error type checks here if needed
    throw new Error(`Failed to transcribe audio: ${errorMessage}`);
  }
};

// Additional utility to handle file uploads and convert to format expected by Deepgram
export const prepareAudioForTranscription = async (file: File): Promise<Blob> => {
  // For some audio formats, conversion might be necessary
  // This is a placeholder for any pre-processing needed
  console.log(`Preparing audio file: ${file.name}, Type: ${file.type}, Size: ${file.size}`);
  // You might add checks here for specific mime types if needed
  return file;
};

// Function to estimate transcription cost based on audio duration
export const estimateTranscriptionCost = (durationSeconds: number): number => {
  // Deepgram pricing is per second (this is a simplified calculation)
  const costPerMinute = 0.0042; // Example rate for Nova-2 model
  return (durationSeconds / 60) * costPerMinute;
};
