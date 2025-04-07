
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Play } from 'lucide-react';
import { toast } from 'sonner';

interface AudioUploaderProps {
  onAudioUploaded: (blob: Blob) => void;
  isProcessing: boolean;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ onAudioUploaded, isProcessing }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Create audio element for playback
  React.useEffect(() => {
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const audioFile = files[0];
    
    // Check if the file is an audio file
    if (!audioFile.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }

    setIsUploading(true);
    setCurrentFile(audioFile);

    try {
      // Pass the blob to the parent component
      onAudioUploaded(audioFile);
      toast.success('Audio file uploaded successfully');
    } catch (error) {
      console.error('Error processing audio file:', error);
      toast.error('Failed to process the audio file');
    } finally {
      setIsUploading(false);
      // Don't reset the file input so user can play it back
    }
  };

  const playAudio = () => {
    if (!currentFile) {
      toast.error('No audio file uploaded');
      return;
    }

    // Clean up previous playback
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }

    // Create new audio URL
    audioUrlRef.current = URL.createObjectURL(currentFile);
    
    if (audioElementRef.current) {
      audioElementRef.current.src = audioUrlRef.current;
      audioElementRef.current.play()
        .then(() => {
          toast.info('Playing uploaded audio');
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

  return (
    <div className="flex flex-col items-center space-y-4">
      <label 
        htmlFor="audio-upload"
        className={`
          flex flex-col items-center justify-center
          w-full h-32 
          border-2 border-dashed 
          rounded-lg 
          cursor-pointer 
          bg-gray-50 
          hover:bg-gray-100 
          transition-colors
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-2 text-black" />
          <p className="mb-2 text-sm text-gray-500 font-helvetica">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 font-helvetica">
            MP3, WAV or M4A (max. 10MB)
          </p>
        </div>
        <input 
          id="audio-upload" 
          type="file" 
          accept="audio/*" 
          className="hidden"
          onChange={handleFileChange}
          disabled={isProcessing || isUploading}
        />
      </label>

      {currentFile && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600 font-helvetica truncate max-w-[200px]">
            {currentFile.name}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={playAudio}
            disabled={isProcessing}
          >
            <Play size={16} className="mr-1" /> Play
          </Button>
        </div>
      )}

      {isUploading && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 font-helvetica">Uploading audio...</p>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
