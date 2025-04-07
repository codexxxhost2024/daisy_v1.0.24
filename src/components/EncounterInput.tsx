
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

const EncounterInput = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-28">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-gray-800 font-helvetica">New Encounter Input</h2>
        <span className="text-gray-500 font-helvetica">READY</span>
      </div>
      
      <div className="space-y-6">
        <div>
          <p className="text-base mb-2 text-gray-700 font-helvetica">Encounter Date and Time</p>
          <Select defaultValue="now">
            <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded-lg">
              <SelectValue placeholder="Select date and time..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="now">03/31/2025, 6:11:32.851PM</SelectItem>
              <SelectItem value="custom">Custom Date/Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="font-medium text-gray-700 font-helvetica">Outputs: <span className="font-normal">SOAP, Nursing, Billing, Pharmacy, Social Work, Legal, Admin</span></p>
        </div>
        
        <Button className="w-full bg-black text-white hover:bg-gray-800 font-helvetica h-14 text-lg rounded-lg font-medium">
          <Mic className="mr-2" />
          Start Recording
        </Button>
      </div>
    </div>
  );
};

export default EncounterInput;
