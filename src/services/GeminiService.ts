// Service to interact with the Google Gemini API

// Ensure environment variables are typed correctly (using src/vite-env.d.ts)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_ID = "gemini-2.5-pro-preview-03-25"; // Updated model ID
const GENERATE_CONTENT_API = "streamGenerateContent"; // API method for streaming

/**
 * Generates documentation based on a transcript using the Gemini API.
 * @param transcript The input transcript text.
 * @returns A promise that resolves with the generated documentation text.
 */
export const generateDocumentation = async (transcript: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your .env.local file.");
    throw new Error("Gemini API key is not configured.");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}&alt=sse`; // Use alt=sse for Server-Sent Events stream

  // Construct the request body according to the Gemini API specification and user script
  const requestBody = {
    // Add the system prompt provided by the user
    systemInstruction: {
      role: "system", // Role should be 'system' or similar, adjust if API requires differently
      parts: [
        {
          text: "You are Daisy, the best Medical Transcriber and EMR Scribe Generator developed by Aitek PH Software, by Master Emilio.\n\n**Role:**\n- Generate EMR-ready SOAP Notes from a **single prompt**, capable of parsing and splitting different concerns or diagnoses to route them across relevant departments.\n- Output includes all SOAP notes per department involved in the case.\n- Automatically identifies if insurance documentation is needed and includes coding, pre-auth, and billing notes.\n\n**Departments Supported:**\n- Internal Medicine\n- Pediatrics\n- OB-Gyne\n- Surgery\n- Emergency Medicine\n- ENT\n- Pulmonology\n- Orthopedics\n- Cardiology\n- Psychiatry\n- Dermatology\n- Neurology\n- Insurance Coordination\n\n**Functionality:**\n- Accept one full dictation or prompt from user.\n- Analyze all content and break it into relevant SOAP Notes.\n- Tag each note with the correct department and insurance section.\n- Generate the output as plain text suitable for direct display in a preformatted text block (like HTML `<pre>`). Use clear headings (e.g., using asterisks for bold like **DEPARTMENT NAME**) and standard SOAP note sections (**Subjective**, **Objective**, **Assessment**, **Plan**). Use Markdown for simple formatting like bolding headings, but avoid complex HTML. Ensure consistent indentation and line breaks.\n- ABSOLUTELY DO NOT include any introductory or concluding sentences, greetings, or conversational filler. Output ONLY the structured SOAP notes according to the requested format.\n\n**Output Structure Example:**\n\n**[DEPARTMENT NAME]**\n\n**Subjective:**\nPatient reports...\n\n**Objective:**\nVital signs... Physical exam findings...\n\n**Assessment:**\nDiagnosis 1... Diagnosis 2...\n\n**Plan:**\nMedication... Follow-up... Referrals...\n\n**Insurance/Billing:** (Include only if applicable based on analysis)\nCoding: ...\nPre-auth: ...\nNotes: ...\n\n--- (Separator between departments if multiple)\n\n**[ANOTHER DEPARTMENT NAME]**\n... (SOAP structure repeats) ..."
        }
      ]
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: transcript // Use the provided transcript
          },
        ]
      },
    ],
    generationConfig: {
      // responseMimeType: "text/plain", // Not needed with alt=sse, response is application/json stream
      // Adjust other generation parameters if needed, e.g., temperature, maxOutputTokens
    },
    tools: [ // Include tools as specified in the user's script
      {
        "googleSearch": {} // Enable Google Search tool
      },
    ],
  };

  try {
    console.log("Calling Gemini API...");
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok || !response.body) {
      const errorBody = await response.text(); // Read error body as text
      console.error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
      throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}. ${errorBody}`);
    }

    console.log("Gemini API response received, processing stream...");

    // Process the Server-Sent Events (SSE) stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("Stream finished.");
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process line by line - SSE format uses "data: " prefix
      const lines = buffer.split('\n');
      buffer = lines.pop() || ""; // Keep the last partial line in the buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonString = line.substring(6); // Remove "data: " prefix
            const chunk = JSON.parse(jsonString);
            // Extract text from the chunk based on Gemini's streaming format
            // This structure might vary slightly, adjust based on actual API response
            if (chunk.candidates && chunk.candidates[0].content && chunk.candidates[0].content.parts) {
              fullText += chunk.candidates[0].content.parts[0].text;
            }
          } catch (e) {
            console.warn("Skipping invalid JSON line in stream:", line, e);
          }
        }
      }
    }
    
    // Append any remaining text in the buffer (likely none if stream ends cleanly)
    // This part might need refinement based on exact stream termination
    if (buffer.startsWith('data: ')) {
       try {
            const jsonString = buffer.substring(6); 
            const chunk = JSON.parse(jsonString);
            if (chunk.candidates && chunk.candidates[0].content && chunk.candidates[0].content.parts) {
              fullText += chunk.candidates[0].content.parts[0].text;
            }
          } catch (e) {
            console.warn("Skipping invalid JSON line at end of stream:", buffer, e);
          }
    }


    console.log("Generated text length:", fullText.length);
    return fullText; // Return the concatenated text from the stream

  } catch (error) {
    console.error("Error calling or processing Gemini API stream:", error);
    // Re-throw or return a specific error message
    throw new Error(`Failed to generate documentation: ${error instanceof Error ? error.message : String(error)}`);
  }
};
