import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavbar from '@/components/BottomNavbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, Copy, FileEdit } from 'lucide-react'; // Icons for buttons

const EditPage = () => {
  const { filename: encodedFilename } = useParams<{ filename: string }>();
  const navigate = useNavigate();
  const [fileContent, setFileContent] = useState<string>('');
  const [originalFilename, setOriginalFilename] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Decode filename safely
  useEffect(() => {
    if (encodedFilename) {
      try {
        setOriginalFilename(decodeURIComponent(encodedFilename));
      } catch (e) {
        console.error('Error decoding filename:', e);
        setError('Invalid filename provided.');
        toast.error('Invalid filename provided.');
        setLoading(false);
      }
    } else {
      setError('No filename provided.');
      toast.error('No filename provided.');
      setLoading(false);
    }
  }, [encodedFilename]);

  // Fetch file content
  const fetchFileContent = useCallback(async () => {
    if (!originalFilename) return;

    setLoading(true);
    setError(null);
    try {
      const { data, error: downloadError } = await supabase.storage
        .from('scribes')
        .download(originalFilename); // Download the specific file

      if (downloadError) throw downloadError;
      if (!data) throw new Error('No data received for file.');

      const text = await data.text(); // Read Blob as text
      setFileContent(text);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error fetching file content for ${originalFilename}:`, err);
      setError(`Failed to load file content: ${message}`);
      toast.error(`Failed to load file content: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [originalFilename]);

  useEffect(() => {
    if (originalFilename) {
      fetchFileContent();
    }
  }, [originalFilename, fetchFileContent]);

  const handleSave = async () => {
    if (!originalFilename) return;
    setSaving(true);
    toast.info('Saving changes...');
    try {
      // Implement Supabase Storage update (overwrite)
      const { error: uploadError } = await supabase.storage
        .from('scribes')
        .update(originalFilename, fileContent, {
          cacheControl: '3600',
          upsert: false, // Important: update only, don't create if missing
          contentType: 'text/plain;charset=UTF-8',
        });

      if (uploadError) throw uploadError;

      toast.success(`File "${originalFilename}" saved successfully!`);
      // Optionally navigate back or refresh list data
      // navigate('/list'); // Example navigation

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error saving file ${originalFilename}:`, err);
      toast.error(`Failed to save file: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsNew = async () => {
    // Prompt user for a new filename (simple prompt for now)
    const newFilenameBase = originalFilename.replace('.txt', '');
    const newFilenameInput = prompt(`Enter new filename (e.g., ${newFilenameBase}_copy.txt):`, `${newFilenameBase}_copy.txt`);

    if (!newFilenameInput || !newFilenameInput.trim()) {
      toast.warning('Save As New cancelled.');
      return;
    }
    const newFilename = newFilenameInput.trim().endsWith('.txt') ? newFilenameInput.trim() : `${newFilenameInput.trim()}.txt`;

    if (newFilename === originalFilename) {
        toast.error('New filename cannot be the same as the original.');
        return;
    }

    setSaving(true);
    toast.info(`Saving as "${newFilename}"...`);
    try {
      // Implement Supabase Storage upload (create new)
       const { error: uploadError } = await supabase.storage
        .from('scribes')
        .upload(newFilename, fileContent, {
          cacheControl: '3600',
          upsert: false, // Do not overwrite if it somehow exists
          contentType: 'text/plain;charset=UTF-8',
        });

       if (uploadError) {
         // Check if error is because file already exists
         if (uploadError.message?.includes('Duplicate')) {
            toast.error(`File "${newFilename}" already exists. Please choose a different name.`);
            return; // Stop execution
         }
         throw uploadError; // Re-throw other errors
       }

      toast.success(`File saved as "${newFilename}" successfully!`);
      // Optionally navigate to list or new file view
      navigate('/list'); // Navigate back to list after saving new

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error saving file as ${newFilename}:`, err);
      toast.error(`Failed to save as new file: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRename = async () => {
     if (!originalFilename) return;

     // Prompt user for the new filename
     const newFilenameInput = prompt(`Enter new name for "${originalFilename}":`, originalFilename);

     if (!newFilenameInput || !newFilenameInput.trim() || newFilenameInput.trim() === originalFilename) {
       toast.warning('Rename cancelled or filename unchanged.');
       return;
     }
     const newFilename = newFilenameInput.trim().endsWith('.txt') ? newFilenameInput.trim() : `${newFilenameInput.trim()}.txt`;

     setSaving(true); // Use saving state for rename operation as well
     toast.info(`Renaming "${originalFilename}" to "${newFilename}"...`);
     try {
        // Supabase Storage: move (rename) is copy + delete
        const { error: copyError } = await supabase.storage
            .from('scribes')
            .copy(originalFilename, newFilename);

        if (copyError) {
            // Check if error is because the new file name already exists
            if (copyError.message?.includes('Duplicate')) {
                toast.error(`File "${newFilename}" already exists. Cannot rename.`);
                return; // Stop execution
            }
            throw copyError; // Re-throw other copy errors
        }

        // If copy is successful, delete the original file
        const { error: deleteError } = await supabase.storage
            .from('scribes')
            .remove([originalFilename]);

        if (deleteError) {
            // Log error but proceed, as the file is already copied
            console.error(`Failed to delete original file "${originalFilename}" after rename:`, deleteError);
            toast.warning(`Renamed to "${newFilename}", but failed to remove original file. Please check storage.`);
        } else {
            toast.success(`File renamed to "${newFilename}" successfully!`);
        }

        // Update state and navigate back to list page with the new name potentially highlighted or refreshed
        setOriginalFilename(newFilename); // Update state to reflect rename
        navigate('/list'); // Navigate back to list

     } catch (err: unknown) {
       const message = err instanceof Error ? err.message : String(err);
       console.error(`Error renaming file ${originalFilename} to ${newFilename}:`, err);
       toast.error(`Failed to rename file: ${message}`);
     } finally {
       setSaving(false);
     }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto pt-20 pb-24 px-4">
        <h1 className="text-2xl font-semibold mb-4">Edit Scribe: {originalFilename || 'Loading...'}</h1>

        {loading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-600">Loading file content...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            <Textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              placeholder="Scribe content..."
              className="min-h-[400px] text-sm font-mono" // Adjust height and style as needed
              disabled={saving} // Disable textarea while saving
            />
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
               <Button
                 onClick={handleRename}
                 variant="outline"
                 disabled={saving || loading}
                 className="flex items-center gap-1.5"
               >
                 <FileEdit size={16} />
                 Rename File
               </Button>
               <Button
                 onClick={handleSaveAsNew}
                 variant="outline"
                 disabled={saving || loading}
                 className="flex items-center gap-1.5"
               >
                 <Copy size={16} />
                 Save as New...
               </Button>
              <Button
                onClick={handleSave}
                disabled={saving || loading}
                className="flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </main>

      <BottomNavbar />
    </div>
  );
};

export default EditPage;
