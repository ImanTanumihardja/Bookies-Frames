import React from 'react';

interface ProgressBarProps {
  spreadPercent: number;
  height?: string; // Optional height prop
}

const ProgressBar: React.FC<ProgressBarProps> = ({ spreadPercent, height }) => {
  return (
    <div 
      className="w-full bg-whitesmoke rounded-xl flex items-start justify-start relative overflow-hidden z-[1]" 
      style={{ paddingBottom: height ? undefined : '2%', height: height }}
    >
      <div 
        className="absolute top-0 left-0 h-full [background:linear-gradient(90deg,_#feae26,_#d44fc9_49.5%,_#7a65ec)]"
        style={{ width: `${spreadPercent}%`, height: '100%' }} 
      />
    </div>
  );
}

export default ProgressBar;
