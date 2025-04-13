import React, { useState } from 'react';
import { toast } from 'react-toastify';

const HintPanel = ({ game, difficulty, isPlayerTurn, onHintReceived, hints }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHintType, setSelectedHintType] = useState('bestMove');
  const [showHintOptions, setShowHintOptions] = useState(false);
  const [usedHints, setUsedHints] = useState(0);
  const [hintsLimit, setHintsLimit] = useState(hints);

  const hintOptions = [
    { 
      id: 'strategic', 
      name: 'Strategic Advice', 
      description: 'General position evaluation and strategy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      id: 'piece', 
      name: 'Which Piece to Move', 
      description: 'Shows which piece to consider without destination',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      )
    },
    { 
      id: 'tactical', 
      name: 'Tactical Opportunity', 
      description: 'Highlights tactical opportunities or threats',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    { 
      id: 'bestMove', 
      name: 'Best Move', 
      description: 'Reveals the best move in the position',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  const requestHint = async () => {
    if (!game || !isPlayerTurn) {
      toast.info('Hint not available right now', { position: 'top-center', autoClose: 2000 });
      return;
    }

    if (usedHints >= hintsLimit) {
      toast.warning(`You've reached the limit of ${hintsLimit} hints per game`, { 
        position: 'bottom-right', 
        autoClose: 3000 
      });
      return;
    }

    try {
      setIsLoading(true);
      const fen = game.fen();
      
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_ENGINE_API_URL}hint?fen=${encodeURIComponent(fen)}&type=${selectedHintType}&depth=${difficulty}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get hint from server');
      }

      const hintData = await response.json();
      
      // Increment used hints counter
      setUsedHints(prev => prev + 1);
      
      // Pass hint data to parent component
      onHintReceived(hintData);
      
      // Show toast based on hint type
      displayHintToast(hintData);
      
    } catch (error) {
      console.error('Error getting hint:', error);
      toast.error('Failed to get hint', { position: 'bottom-right', autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const displayHintToast = (hintData) => {
    const { hintType } = hintData;
    
    switch (hintType) {
      case 'strategic':
        toast.info(hintData.advice, {
          position: 'bottom-right',
          autoClose: 5000
        });
        break;
        
      case 'pieceSelection':
        toast.info(`Consider moving the piece at ${hintData.fromSquare}`, {
          position: 'bottom-right',
          autoClose: 3000
        });
        break;
        
      case 'tactical':
        toast.info(hintData.message, {
          position: 'bottom-right',
          autoClose: 4000
        });
        break;
        
      case 'bestMove':
        toast.success(`Best move: ${hintData.from} to ${hintData.to}`, {
          position: 'bottom-right',
          autoClose: 3000
        });
        break;
        
      default:
        toast.info('Hint received', {
          position: 'bottom-right',
          autoClose: 2000
        });
    }
  };

  const resetHints = () => {
    setUsedHints(0);
  };

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-4 w-full text-white border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Game Hints
        </h3>
        <div className="text-sm">
          <span className="px-2 py-1 rounded-full bg-gray-700 text-indigo-300 font-medium">
            {usedHints}/{hintsLimit === Infinity ? "∞" : hintsLimit}
          </span>
        </div>
      </div>

      <div className="mb-4 relative">
        <button
          onClick={() => setShowHintOptions(!showHintOptions)}
          className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded flex justify-between items-center transition-colors border border-gray-600"
        >
          <div className="font-medium flex items-center text-white">
            {hintOptions.find(option => option.id === selectedHintType)?.icon}
            <span className="ml-2">{hintOptions.find(option => option.id === selectedHintType)?.name || 'Select hint type'}</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${showHintOptions ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {showHintOptions && (
          <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded shadow-lg">
            {hintOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedHintType(option.id);
                  setShowHintOptions(false);
                }}
                className={`w-full text-left px-3 py-3 hover:bg-gray-600 transition-colors ${
                  selectedHintType === option.id ? 'bg-indigo-900 border-l-4 border-indigo-500' : ''
                }`}
              >
                <div className="font-medium flex items-center">
                  <span className="mr-2 text-indigo-400">{option.icon}</span>
                  {option.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={requestHint}
        disabled={isLoading || usedHints >= hintsLimit || !isPlayerTurn}
        className={`w-full py-2 px-4 rounded-md font-medium transition-all ${
          isLoading 
            ? 'bg-indigo-900 text-indigo-300 cursor-wait'
            : usedHints >= hintsLimit || !isPlayerTurn
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-md'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing Position...
          </span>
        ) : usedHints >= hintsLimit ? (
          <span className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            No Hints Remaining
          </span>
        ) : !isPlayerTurn ? (
          <span className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hint Available on Your Turn
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Get Hint
          </span>
        )}
      </button>

      <div className="mt-4 p-3 bg-gray-700 rounded-md border border-gray-600 text-sm text-gray-300">
        <div className="flex items-start mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Hints provide guidance based on your selected type. More specific hints reveal more detailed information.</p>
        </div>
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>Hints are computed at depth {difficulty}, which may not always indicate the absolute best move in all positions.</p>
        </div>
      </div>
    </div>
  );
};

export default HintPanel;