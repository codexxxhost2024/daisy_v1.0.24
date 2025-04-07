
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Send, Pause, Square, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LiveAudioVisualizer } from 'react-audio-visualize';
import { transcribeAudio } from '@/services/DeepgramService'; // Use named import

interface AudioRecorderProps {
  onTranscriptionComplete: (transcript: string) => void;
  isProcessing: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onTranscriptionComplete,
  isProcessing
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  // Removed audioContextRef and analyserRef
  const audioUrlRef = useRef<string | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Format recording time to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Handle timer for recording duration
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  // Create audio element for playback
  useEffect(() => {
    audioElementRef.current = new Audio();
    audioElementRef.current.onended = () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };

    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Removed visualizer setup logic here
      
      // Find supported mime types
      const supportedTypes = [
        'audio/webm;codecs=opus', 
        'audio/ogg;codecs=opus',
        'audio/webm', 
        'audio/ogg', 
        'audio/mp4', 
        'audio/aac'
      ];

      let options = {};
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          options = { mimeType: type };
          console.log(`Using mimeType: ${type}`);
          break;
        }
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorderRef.current?.mimeType || 'audio/wav' 
        });
        setAudioBlob(audioBlob);
        setRecordingTime(0);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };
  
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        toast.info('Recording paused');
      } else if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        toast.info('Recording resumed');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Stop all audio tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null; // Clear stream ref
      }
      // Removed visualizer cleanup logic here
      toast.success('Recording stopped');
    }
  };

  const playRecording = () => {
    if (!audioBlob) {
      toast.error('No recording to play');
      return;
    }

    // Clean up previous playback
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }

    // Create new audio URL
    audioUrlRef.current = URL.createObjectURL(audioBlob);
    
    if (audioElementRef.current) {
      audioElementRef.current.src = audioUrlRef.current;
      audioElementRef.current.play()
        .then(() => {
          toast.info('Playing recorded audio');
        })
        .catch(err => {
          toast.error(`Playback error: ${err.message}`);
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
          }
        });
    }
  };
  
  const sendAudioForTranscription = async () => {
    if (!audioBlob) {
      toast.error('No audio recorded');
      return;
    }

    setIsTranscribing(true);
    
    try {
      // Call the actual Deepgram service using the named import
      const result = await transcribeAudio(audioBlob); // Use the imported function
      onTranscriptionComplete(result.transcript); // Pass the transcript string
      setAudioBlob(null); // Clear blob after successful transcription
      toast.success('Transcription complete');
    } catch (error) {
      console.error('Transcription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to transcribe audio: ${errorMessage}`);
      setIsTranscribing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      // Ensure stream and context are stopped on unmount
      // Ensure stream is stopped on unmount
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      // Removed context cleanup
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800 font-helvetica">Record Dictation</h2>
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
            <span className="text-sm font-medium text-gray-600 font-helvetica">{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {/* Audio Visualizer - Use LiveAudioVisualizer */}
      {isRecording && !isPaused && mediaRecorderRef.current && (
        <div className="my-3 h-16 flex items-center justify-center">
          {/* Pass mediaRecorder directly to LiveAudioVisualizer */}
          <LiveAudioVisualizer
            mediaRecorder={mediaRecorderRef.current}
            width={200}
            height={50}
            barColor="#000000" // Black bars
            barWidth={3}
            gap={2}
          />
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        <div className="flex justify-center gap-4">
          {isRecording ? (
            <>
              <Button 
                onClick={pauseRecording}
                size="lg"
                className="w-12 h-12 rounded-full bg-yellow-500 hover:bg-yellow-600"
                disabled={isProcessing}
              >
                {/* Use Play icon for Resume, Pause icon for Pause */}
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </Button>
              <Button
                onClick={stopRecording}
                size="lg"
                className="w-12 h-12 rounded-full bg-black hover:bg-gray-800"
                disabled={isProcessing}
              >
                <Square className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button 
              onClick={startRecording} 
              size="lg"
              className="w-16 h-16 rounded-full bg-black hover:bg-gray-800"
              disabled={isTranscribing || isProcessing}
            >
              <Mic className="h-6 w-6 text-white" />
            </Button>
          )}
        </div>
        
        {audioBlob && !isRecording && !isTranscribing && (
          <div className="flex justify-center gap-2 flex-wrap">
            <Button 
              onClick={playRecording}
              className="bg-black hover:bg-gray-800 text-white"
              disabled={isProcessing}
            >
              Play Recording
            </Button>
            <Button 
              onClick={sendAudioForTranscription}
              className="bg-black hover:bg-gray-800 text-white"
              disabled={isProcessing}
            >
              <Send className="h-4 w-4 mr-2" />
              Transcribe Audio
            </Button>
          </div>
        )}
        
        {isTranscribing && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-black" />
            <span className="ml-2 text-sm text-gray-600 font-helvetica">Transcribing...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
