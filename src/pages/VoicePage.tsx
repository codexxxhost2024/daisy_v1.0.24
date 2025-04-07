import React from 'react';

const VoicePage: React.FC = () => {
  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <iframe
        src="/voicedaisy/daisy-medi-main/index.html" // Path relative to the public directory
        title="Voice Interface"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="microphone; camera; display-capture; autoplay;"
      />
    </div>
  );
};

export default VoicePage;
