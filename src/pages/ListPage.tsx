
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Header from '@/components/Header';
import BottomNavbar from '@/components/BottomNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Search, Loader2, FileText, Edit } from 'lucide-react'; // Added Edit icon
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import type { FileObject } from '@supabase/storage-js'; // Import FileObject type
import { toast } from 'sonner'; // Import toast for error handling

// Define the type for a single file object from Supabase Storage
type ScribeFile = FileObject;

const ListPage = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [files, setFiles] = useState<ScribeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch file list from the 'scribes' storage bucket
        const { data, error: listError } = await supabase.storage
          .from('scribes')
          .list('', { // List all files in the root of the bucket
            limit: 100, // Adjust limit as needed
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }, // Sort by creation date descending
          });

        if (listError) throw listError;

        // Filter out any potential null entries and ensure they are TXT files
        const txtFiles = (data || []).filter(file => file.name.endsWith('.txt'));

        setFiles(txtFiles); // Set the fetched file objects

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Error fetching files:', err);
        setError(`Failed to load files: ${message}`);
        toast.error(`Failed to load files: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []); // Empty dependency array means this runs once on mount

  // Function to format date/time nicely
  const formatDateTime = (isoString: string | undefined) => { // Allow undefined for storage type safety
    if (!isoString) return 'Invalid Date';
    try {
      // Supabase storage uses ISO 8601 format like '2024-04-06T21:03:00.123Z'
      return new Date(isoString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return isoString; // Fallback
    }
  };

  // Function to handle viewing a file
  const handleViewClick = (fileName: string) => {
    try {
      // Manually construct the URL in the required format
      const projectId = 'cxvkrowmpebjvkpmmtij'; // Extracted from .env.local
      const bucketName = 'scribes';
      // Note the double slash "//" after the bucket name as requested
      const fileUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucketName}//${fileName}`;

      if (fileUrl) {
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      } else {
        // This case is unlikely with manual construction but kept for safety
        throw new Error('Could not construct file URL.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error opening file URL for ${fileName}:`, err);
      toast.error(`Failed to open file: ${message}`);
    }
  };

  // Function to handle editing a file (navigates to edit page)
  const handleEditClick = (fileName: string) => {
    // Encode the filename to handle special characters in URL
    navigate(`/edit/${encodeURIComponent(fileName)}`);
  };

  // Filter files based on search term (case-insensitive filename match)
  const filteredFiles = useMemo(() => {
    if (!searchTerm) {
      return files; // No search term, return all files
    }
    return files.filter(file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [files, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto pt-20 pb-24 px-4 overflow-y-auto">
        {/* Removed redundant header text div */}

        {/* Search and Filter (kept for UI structure, functionality not implemented) */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search scribes by filename..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Update search term state
            />
          </div>
          {/* Date filter button - functionality not implemented yet */}
          <Button variant="outline" className="flex items-center gap-2" disabled>
            <Calendar size={18} />
            <span>Filter by Date</span>
          </Button>
        </div>

        {/* Scribe List */}
        <div className="space-y-4">
          {loading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-600">Loading files...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">
              <p>Error loading files:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {error && (
            <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">
              <p>Error loading files:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Display message based on filtered results */}
          {!loading && !error && filteredFiles.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              {searchTerm ? `No files found matching "${searchTerm}".` : 'No scribe files found in storage.'}
            </div>
          )}

          {/* Map over filtered files */}
          {!loading && !error && filteredFiles.map((file) => (
            <Card key={file.id ?? file.name} className="shadow-sm hover:shadow transition-shadow">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-4">
                  {/* Display File Name */}
                  <CardTitle className="text-lg font-semibold truncate" title={file.name}>{file.name}</CardTitle>
                  {/* Display formatted creation date */}
                  <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">{formatDateTime(file.created_at)}</span> {/* Use file.created_at */}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex justify-end"> {/* Adjusted padding and added flex justify-end */}
                {/* Add View File button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewClick(file.name)}
                  className="flex items-center gap-1.5"
                >
                  <FileText size={16} />
                  View File
                </Button>
                {/* Add Edit button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(file.name)}
                  className="flex items-center gap-1.5 ml-2" // Added margin-left
                >
                  <Edit size={16} />
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNavbar />
    </div>
  );
};

export default ListPage;
