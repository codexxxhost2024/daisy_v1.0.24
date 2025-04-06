
import React from 'react';
import Header from '@/components/Header';
import BottomNavbar from '@/components/BottomNavbar';
import PatientSelection from '@/components/PatientSelection';
import EncounterInput from '@/components/EncounterInput';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto pt-20 pb-8 px-4 overflow-y-auto">
        <div className="space-y-6">
          <PatientSelection />
          <EncounterInput />
          {/* Add 35px spacing at the bottom */}
          <div className="h-[35px]"></div>
        </div>
      </main>
      
      <BottomNavbar />
    </div>
  );
};

export default Index;
