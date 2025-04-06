
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Save, Copy, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface ScribeOutputProps {
  htmlContent: string;
}

const ScribeOutput: React.FC<ScribeOutputProps> = ({ htmlContent }) => {
  const [isSaving, setIsSaving] = useState(false);

  // This function parses the HTML to extract the different sections
  const extractSections = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Finding all h1 elements which should be the section titles
    const sections = [];
    const h1Elements = doc.querySelectorAll('h1');
    
    // Default sections if we can't parse them properly
    if (h1Elements.length < 7) {
      return [
        { id: 'soap', title: 'SOAP Note', content: html },
        { id: 'nursing', title: 'Nursing Note', content: '' },
        { id: 'insurance', title: 'Insurance & Billing', content: '' },
        { id: 'pharmacy', title: 'Pharmacy Note', content: '' },
        { id: 'social', title: 'Social Work Note', content: '' },
        { id: 'legal', title: 'Legal & Compliance', content: '' },
        { id: 'admin', title: 'Administrative Note', content: '' },
      ];
    }
    
    // Extract each section
    for (let i = 0; i < h1Elements.length; i++) {
      const title = h1Elements[i].textContent || `Section ${i+1}`;
      let content = '';
      
      // Get content until the next h1
      const node = h1Elements[i];
      let currentNode = node.nextSibling;
      const fragment = document.createDocumentFragment();
      
      while (currentNode && (currentNode.nodeName !== 'H1')) {
        const nextNode = currentNode.nextSibling;
        fragment.appendChild(currentNode.cloneNode(true));
        currentNode = nextNode;
      }
      
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(fragment.cloneNode(true));
      content = `<h1>${title}</h1>${tempDiv.innerHTML}`;
      
      // Create a unique ID from the title
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      sections.push({ id, title, content });
    }
    
    return sections;
  };

  const sections = extractSections(htmlContent);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, you would save to Supabase here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Documentation saved successfully');
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      toast.error('Failed to save documentation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = (content: string) => {
    // Strip HTML tags for plain text copy
    const tempElement = document.createElement('div');
    tempElement.innerHTML = content;
    const plainText = tempElement.textContent || tempElement.innerText;
    
    navigator.clipboard.writeText(plainText)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Medical Documentation</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #075985; margin-top: 20px; }
              h2 { color: #0EA5E9; }
              hr { border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      toast.error('Could not open print window. Check popup settings.');
    }
  };

  if (!htmlContent) {
    return null;
  }

  return (
    <div className="px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-medical-dark">Medical Documentation</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="text-xs"
          >
            <Printer className="h-3 w-3 mr-1" />
            Print
          </Button>
          <Button 
            onClick={handleSave} 
            size="sm"
            className="text-xs bg-medical-primary hover:bg-medical-primary/90"
            disabled={isSaving}
          >
            <Save className="h-3 w-3 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue={sections[0]?.id || 'soap'}>
        <TabsList className="w-full overflow-x-auto flex-nowrap whitespace-nowrap mb-4">
          {sections.map(section => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="text-xs md:text-sm"
            >
              {section.title.replace(/note|notes/i, '')}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {sections.map(section => (
          <TabsContent key={section.id} value={section.id} className="relative">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 text-xs"
              onClick={() => handleCopy(section.content)}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ScribeOutput;
