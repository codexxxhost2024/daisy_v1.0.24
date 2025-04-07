
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';

// Define the Patient type
interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  contact_number?: string;
  email?: string;
  address?: string;
}

const PatientSelection = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [newPatient, setNewPatient] = useState<Omit<Patient, 'id'>>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    contact_number: '',
    email: '',
    address: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');

  // Fetch patients using React Query
  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('last_name', { ascending: true });
      
      if (error) {
        toast.error('Error fetching patients');
        throw error;
      }
      
      return data as Patient[];
    }
  });

  // Handle adding a new patient
  const handleAddPatient = async () => {
    if (!newPatient.first_name || !newPatient.last_name) {
      toast.error('First name and last name are required');
      return;
    }

    try {
      const { error } = await supabase
        .from('patients')
        .insert([newPatient]);

      if (error) throw error;
      
      toast.success('Patient added successfully');
      setOpenDialog(false);
      refetch(); // Refresh the patients list
      
      // Reset the form
      setNewPatient({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        contact_number: '',
        email: '',
        address: ''
      });
      
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error('Failed to add patient');
    }
  };

  // Handle input changes for the new patient form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPatient(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes for the new patient form
  const handleSelectChange = (name: string, value: string) => {
    setNewPatient(prev => ({ ...prev, [name]: value }));
  };

  // Filter patients based on search term
  const filteredPatients = patients?.filter(patient => 
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-gray-800 font-helvetica">Patient Selection</h2>
        <button 
          className="text-gray-700 p-1 rounded-full hover:bg-gray-100"
          onClick={() => setOpenDialog(true)}
        >
          <UserPlus size={24} />
        </button>
      </div>
      
      <div className="space-y-6">
        <div>
          <p className="text-base mb-2 text-gray-700 font-helvetica">Search Patients</p>
          <Input 
            type="text" 
            placeholder="Search by name or ID..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <p className="text-base mb-2 text-gray-700 font-helvetica">Select Patient</p>
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-full bg-gray-50 border border-gray-200 rounded-lg">
              <SelectValue placeholder="Select a patient..." />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading">Loading patients...</SelectItem>
              ) : filteredPatients && filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {`${patient.first_name} ${patient.last_name}`}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-results">No patients found</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Add Patient Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input 
                  id="first_name" 
                  name="first_name"
                  value={newPatient.first_name}
                  onChange={handleInputChange}
                  placeholder="First Name" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input 
                  id="last_name" 
                  name="last_name"
                  value={newPatient.last_name}
                  onChange={handleInputChange}
                  placeholder="Last Name" 
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input 
                  id="date_of_birth" 
                  name="date_of_birth"
                  type="date"
                  value={newPatient.date_of_birth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={newPatient.gender} 
                  onValueChange={(value) => handleSelectChange('gender', value)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input 
                id="contact_number" 
                name="contact_number"
                value={newPatient.contact_number}
                onChange={handleInputChange}
                placeholder="Contact Number" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email"
                value={newPatient.email}
                onChange={handleInputChange}
                placeholder="Email" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                name="address"
                value={newPatient.address}
                onChange={handleInputChange}
                placeholder="Address" 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPatient}>
              Add Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientSelection;
