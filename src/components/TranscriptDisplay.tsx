
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Send, Edit, X } from 'lucide-react';
import { toast } from 'sonner';

interface TranscriptDisplayProps {
  transcript: string;
  onSubmit: (text: string) => void;
  isProcessing: boolean;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ 
  transcript, 
  onSubmit,
  isProcessing 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(transcript);

  const handleEdit = () => {
    setEditedTranscript(transcript);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTranscript(transcript);
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Transcript updated');
  };

  const handleSubmit = () => {
    if (editedTranscript.trim()) {
      onSubmit(editedTranscript);
    } else {
      toast.error('Transcript cannot be empty');
    }
  };

  if (!transcript) {
    return null;
  }

  return (
    <div className="px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-black mr-2" />
          <h2 className="text-lg font-semibold text-gray-800 font-helvetica">Transcription</h2>
        </div>
        
        {!isEditing ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEdit}
            className="text-xs border-black text-black hover:bg-gray-100"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
            className="text-xs text-red-600 border-red-600 hover:bg-red-50"
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        )}
      </div>

      {isEditing ? (
        <>
          <Textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            className="min-h-[120px] mb-3 font-helvetica"
            placeholder="Edit the transcription..."
          />
          <div className="flex space-x-2 justify-end">
            <Button size="sm" className="bg-black text-white hover:bg-gray-800" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 mb-3 whitespace-pre-wrap font-helvetica">
            {editedTranscript}
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              className="bg-black hover:bg-gray-800 text-white font-helvetica"
              disabled={isProcessing}
            >
              <Send className="h-4 w-4 mr-2" />
              Generate Documentation
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TranscriptDisplay;
