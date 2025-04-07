
import React from 'react';
import { List, FileText, Mic, User, Stethoscope } from 'lucide-react'; // Import Stethoscope
import { Link, useLocation } from 'react-router-dom';

// Removed ScribeMedicIcon component

const BottomNavbar = () => {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10">
      <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
        <Link to="/list" className={`flex flex-col items-center justify-center w-full py-1 ${location.pathname === '/list' ? 'text-black' : 'text-gray-500'}`}>
          <List size={24} className={location.pathname === '/list' ? 'text-black' : 'text-gray-500'} />
          <span className="text-xs mt-1 font-helvetica">List</span>
        </Link>
        
        <Link to="/template" className={`flex flex-col items-center justify-center w-full py-1 ${location.pathname === '/template' ? 'text-black' : 'text-gray-500'}`}>
          <FileText size={24} className={location.pathname === '/template' ? 'text-black' : 'text-gray-500'} />
          <span className="text-xs mt-1 font-helvetica">Template</span>
        </Link>
        <div className="relative w-full flex justify-center items-center">
          {/* Updated Link for Scribe with Stethoscope icon */}
          <Link to="/scribe" className={`absolute -top-8 bg-black p-4 rounded-full shadow-md ${location.pathname === '/scribe' || location.pathname === '/' ? 'ring-2 ring-offset-2 ring-black' : ''}`}>
            <Stethoscope size={28} className="text-white" /> 
          </Link>
          <span className="text-xs mt-10 text-gray-500 font-helvetica">Scribe</span>
        </div>
        
        <Link to="/voice" className={`flex flex-col items-center justify-center w-full py-1 ${location.pathname === '/voice' ? 'text-black' : 'text-gray-500'}`}>
          <Mic size={24} className={location.pathname === '/voice' ? 'text-black' : 'text-gray-500'} />
          <span className="text-xs mt-1 font-helvetica">Voice</span>
        </Link>
        
        <Link to="/profile" className={`flex flex-col items-center justify-center w-full py-1 ${location.pathname === '/profile' ? 'text-black' : 'text-gray-500'}`}>
          <User size={24} className={location.pathname === '/profile' ? 'text-black' : 'text-gray-500'} />
          <span className="text-xs mt-1 font-helvetica">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavbar;
