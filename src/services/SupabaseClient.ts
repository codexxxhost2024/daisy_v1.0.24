
// This is a mock service for demo purposes
// In a real application, you would implement actual API calls to Supabase

interface ScribeRecord {
  id: string;
  patient_name: string;
  encounter_date: string;
  transcript: string;
  documentation: string;
  created_at: string;
}

export const saveDocumentation = async (
  patientName: string,
  transcript: string,
  documentation: string
): Promise<ScribeRecord> => {
  // In a real application, you would call the Supabase API here
  // For demo purposes, we're returning a mock response after a delay
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockRecord: ScribeRecord = {
    id: crypto.randomUUID(),
    patient_name: patientName,
    encounter_date: new Date().toISOString().split('T')[0],
    transcript,
    documentation,
    created_at: new Date().toISOString()
  };
  
  return mockRecord;
};

export const getRecentDocumentation = async (): Promise<ScribeRecord[]> => {
  // In a real application, you would call the Supabase API here
  // For demo purposes, we're returning mock records after a delay
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockRecords: ScribeRecord[] = [
    {
      id: '1',
      patient_name: 'Maria Santos',
      encounter_date: '2025-03-27',
      transcript: 'Patient, Maria Santos. Date, 03/27/2025...',
      documentation: '<h1>MASTER SOAP NOTE</h1><h2>SUBJECTIVE</h2>...',
      created_at: '2025-03-27T08:45:00Z'
    }
  ];
  
  return mockRecords;
};
