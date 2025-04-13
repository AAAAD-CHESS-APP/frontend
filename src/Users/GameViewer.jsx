import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

const GameViewer = ({ gameData, onClose }) => {
  const [game, setGame] = useState(new Chess());
  const [currentPosition, setCurrentPosition] = useState(0);
  const [positions, setPositions] = useState([]);
  const [moves, setMoves] = useState([]);

  useEffect(() => {
    // Initialize with game data
    if (gameData) {
      // If we have FEN positions, use them directly
      if (gameData.pgn && gameData.pgn.length > 0) {
        setPositions(gameData.pgn);
        setCurrentPosition(0);
      }
      
      // Set up moves for the sidebar
      if (gameData.moves && gameData.moves.length > 0) {
        setMoves(gameData.moves);
      }
    }
  }, [gameData]);

  useEffect(() => {
    // Update the chess instance when position changes
    if (positions.length > 0 && currentPosition >= 0 && currentPosition < positions.length) {
      try {
        const newGame = new Chess();
        newGame.load(positions[currentPosition]);
        setGame(newGame);
      } catch (e) {
        console.error("Invalid FEN:", e);
      }
    }
  }, [currentPosition, positions]);

  const goToStart = () => setCurrentPosition(0);
  const goToEnd = () => setCurrentPosition(positions.length - 1);
  const goToPrevious = () => setCurrentPosition(prev => Math.max(0, prev - 1));
  const goToNext = () => setCurrentPosition(prev => Math.min(positions.length - 1, prev + 1));
  const goToMove = (index) => setCurrentPosition(Math.min(index + 1, positions.length - 1));

  // Custom pieces with your project's piece images
  const customPieces = {
    wP: ({ squareWidth }) => (
      <img src="/assets/pieces/wp.png" alt="White Pawn" style={{ width: squareWidth, height: squareWidth }} />
    ),
    wR: ({ squareWidth }) => (
      <img src="/assets/pieces/wr.png" alt="White Rook" style={{ width: squareWidth, height: squareWidth }} />
    ),
    wN: ({ squareWidth }) => (
      <img src="/assets/pieces/wn.png" alt="White Knight" style={{ width: squareWidth, height: squareWidth }} />
    ),
    wB: ({ squareWidth }) => (
      <img src="/assets/pieces/wb.png" alt="White Bishop" style={{ width: squareWidth, height: squareWidth }} />
    ),
    wQ: ({ squareWidth }) => (
      <img src="/assets/pieces/wq.png" alt="White Queen" style={{ width: squareWidth, height: squareWidth }} />
    ),
    wK: ({ squareWidth }) => (
      <img src="/assets/pieces/wk.png" alt="White King" style={{ width: squareWidth, height: squareWidth }} />
    ),
    bP: ({ squareWidth }) => (
      <img src="/assets/pieces/bp.png" alt="Black Pawn" style={{ width: squareWidth, height: squareWidth }} />
    ),
    bR: ({ squareWidth }) => (
      <img src="/assets/pieces/br.png" alt="Black Rook" style={{ width: squareWidth, height: squareWidth }} />
    ),
    bN: ({ squareWidth }) => (
      <img src="/assets/pieces/bn.png" alt="Black Knight" style={{ width: squareWidth, height: squareWidth }} />
    ),
    bB: ({ squareWidth }) => (
      <img src="/assets/pieces/bb.png" alt="Black Bishop" style={{ width: squareWidth, height: squareWidth }} />
    ),
    bQ: ({ squareWidth }) => (
      <img src="/assets/pieces/bq.png" alt="Black Queen" style={{ width: squareWidth, height: squareWidth }} />
    ),
    bK: ({ squareWidth }) => (
      <img src="/assets/pieces/bk.png" alt="Black King" style={{ width: squareWidth, height: squareWidth }} />
    )
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Game Replay: {gameData.playerColor} vs {gameData.opponent}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-xl">×</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Main chessboard */}
          <div className="w-full md:w-2/3 p-4">
            <Chessboard 
              position={game.fen()}
              arePiecesDraggable={false}
              boardOrientation={gameData.playerColor.toLowerCase() === 'white' ? 'white' : 'black'}
              customDarkSquareStyle={{ backgroundColor: '#888c94' }}
              customLightSquareStyle={{ backgroundColor: '#f0ecec' }}
              customPieces={customPieces}
            />
            
            {/* Controls */}
            <div className="flex justify-center items-center gap-4 mt-4">
              <button 
                onClick={goToStart}
                className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={currentPosition === 0}
              >
                <FiChevronsLeft size={20} />
              </button>
              <button 
                onClick={goToPrevious}
                className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={currentPosition === 0}
              >
                <FiChevronLeft size={20} />
              </button>
              <div className="px-4 py-2 bg-gray-100 rounded">
                {currentPosition} / {positions.length - 1}
              </div>
              <button 
                onClick={goToNext}
                className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={currentPosition === positions.length - 1}
              >
                <FiChevronRight size={20} />
              </button>
              <button 
                onClick={goToEnd}
                className="p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={currentPosition === positions.length - 1}
              >
                <FiChevronsRight size={20} />
              </button>
            </div>
          </div>
          
          {/* Move list sidebar */}
          <div className="w-full md:w-1/3 bg-gray-50 p-4 h-[60vh] overflow-y-auto border-l border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3">Moves</h4>
            <div className="grid grid-cols-1 gap-1">
              {moves.map((moveData, idx) => (
                <div 
                  key={idx} 
                  onClick={() => goToMove(idx)}
                  className={`flex items-center p-2 border-b border-gray-100 cursor-pointer hover:bg-gray-100 ${
                    idx === currentPosition - 1 ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                    moveData.color === 'white' ? 'bg-gray-100' : 'bg-gray-700 text-white'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="font-mono">
                    {moveData.color === 'white' ? 'White: ' : 'Black: '}
                    {moveData.move?.join(' ') || '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameViewer;