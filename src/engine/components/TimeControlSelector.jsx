import React from 'react';

const timeControlOptions = [
  { name: 'Bullet', time: 60 * 1, increment: 0, description: '1 minute per player' },
  { name: 'Bullet+', time: 60 * 1, increment: 1, description: '1+1: 1 minute + 1 second increment' },
  { name: 'Blitz', time: 60 * 3, increment: 0, description: '3 minutes per player' },
  { name: 'Blitz+', time: 60 * 3, increment: 2, description: '3+2: 3 minutes + 2 second increment' },
  { name: 'Rapid', time: 60 * 10, increment: 0, description: '10 minutes per player' },
  { name: 'Classical', time: 60 * 30, increment: 0, description: '30 minutes per player' }
];

const TimeControlSelector = ({ onSelectTimeControl, onCancel, showTimeControl }) => {
  if (!showTimeControl) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white  text-gray-900 p-6 rounded-sm shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-center">Select Time Control</h2>
        
        <div className="grid grid-cols-1 gap-3 mb-4">
          {timeControlOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => onSelectTimeControl(option)}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded text-left transition-colors border border-black-200"
            >
              <div className="">{option.name}</div>
              <div className="text-xs text-gray-600">{option.description}</div>
            </button>
          ))}
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-black text-white hover:bg-slate-800 rounded transition-colors"
          >
            No Time Control
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeControlSelector;