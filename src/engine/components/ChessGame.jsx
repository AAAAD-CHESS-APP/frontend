import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomChessboard from './ChessBoard';
import StockfishStatus from './StockfishStatus';
import GameAnalysis from './GameAnalysis';
import HintPanel from './HintPanel';
import ActiveHint from './ActiveHInt';
import GameTimer from './GameTimer';
import TimeControlSelector from './TimeControlSelector';
import "./slider.css"

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState('w'); // 'w' for white, 'b' for black
  const [gameState, setGameState] = useState({
    isPlayerTurn: true,
    status: 'Your turn',
    lastMove: null,
  });
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [showValidMoves, setShowValidMoves] = useState(false);
  const [validMoves, setValidMoves] = useState({});
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState(15);
  const [showDifficultySlider, setShowDifficultySlider] = useState(false);
  const [customDifficulty, setCustomDifficulty] = useState(15);
  const [moveHistory, setMoveHistory] = useState([]);
  const [showMoveHistory, setShowMoveHistory] = useState(false);
  const [historyDisplayType, setHistoryDisplayType] = useState('moves');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeHint, setActiveHint] = useState(null);
  const [hintSquares, setHintSquares] = useState({});
  const [showHints, setShowHints] = useState(false);
  const [selectedHintLimit, setSelectedHintLimit] = useState(3);
  const [showTimeControlSelector, setShowTimeControlSelector] = useState(false);
  const [timeControlEnabled, setTimeControlEnabled] = useState(false);
  const [timeControl, setTimeControl] = useState(null);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const hintPanelRef = useRef(null);

  // Add event listener for beforeunload to warn the user
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Your changes will not be saved.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Helper function to handle custom difficulty changes
  const handleCustomDifficultyChange = (event) => {
    setCustomDifficulty(Number(event.target.value));
  };

  const applyCustomDifficulty = () => {
    setDifficulty(customDifficulty);
    setShowDifficultySlider(false);
  };

  const difficultyOptions = [
    { label: "Easy", value: 5 },
    { label: "Medium", value: 10 },
    { label: "Hard", value: 15 },
    { label: "Expert", value: 20 }
  ];

  // Get current difficulty label
  const getCurrentDifficultyLabel = () => {
    const option = difficultyOptions.find(opt => opt.value === difficulty);
    return option ? option.label : `Custom difficulty set to ${difficulty}`;
  };

  const toggleMoveHistory = () => {
    setShowMoveHistory(!showMoveHistory);

    if (!showMoveHistory) {
      setShowAnalysis(false);
      setShowHints(false);
    }
  };

  const toggleHints = () => {

    setShowHints(!showHints);

    if (!showHints) {
      setShowAnalysis(false);
      setShowMoveHistory(false);
    }
  }

  // ADD THIS NEW FUNCTION FOR CHANGING HISTORY DISPLAY TYPE
  const changeHistoryDisplayType = (type) => {
    setHistoryDisplayType(type);
  };

  // ADD THIS NEW FUNCTION TO RECORD MOVES IN HISTORY
  const addMoveToHistory = (gameInstance, moveText) => {
    const newMove = {
      moveNumber: moveHistory.length,
      moveText: moveText,
      fen: gameInstance.fen(),
      pgn: gameInstance.pgn()
    };

    setMoveHistory(prev => [...prev, newMove]);
  };

  // Add this new function to handle time control selection
  const handleTimeControlSelection = (selectedTimeControl) => {
    setTimeControl(selectedTimeControl);
    setTimeControlEnabled(true);
    setShowTimeControlSelector(false);
  };

  // Add this function to handle time up event
  const handleTimeUp = (color) => {
    const winner = color === 'white' ? 'Black' : 'White';
    toast.info(`Time's up! ${winner} wins by timeout!`, {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: true
    });

    setGameState(prev => ({
      ...prev,
      isPlayerTurn: false,
      status: `${winner} wins on time!`
    }));

    // Disable the timer
    setIsTimerActive(false);
  };

  // Add this before the game setup UI in your return
  const askForTimeControl = () => {
    setShowTimeControlSelector(true);
  };

  // Start a new game with the selected color
  const startGame = (color) => {

    if (timeControlEnabled && !timeControl) {
      setPlayerColor(color); // Remember the selected color
      setShowTimeControlSelector(true);
      return;
    }

    const newGame = new Chess();
    setGame(newGame);
    setPlayerColor(color);

    const isPlayerTurn = color === 'w'; // If player is white, they go first

    setGameState({
      isPlayerTurn: isPlayerTurn,
      status: isPlayerTurn ? 'Your turn' : 'Stockfish is thinking...',
      lastMove: null,
    });

    setSelectedSquare(null);
    setValidMoves({});
    setGameStarted(true);

    setMoveHistory([{
      moveNumber: 0,
      moveText: "Starting Position",
      fen: newGame.fen(),
      pgn: newGame.pgn()
    }]);

    setShowAnalysis(false);

    if (hintPanelRef.current) {
      hintPanelRef.current.setHintsLimit(selectedHintLimit);
    }

    // Start timer if time control is enabled
    if (timeControlEnabled) {
      setIsTimerActive(true);
    }

    // If player chose black, make Stockfish move first
    if (color === 'b') {
      makeAIMove(newGame);
    }
  };

  // Calculate valid moves for a selected square
  const calculateValidMoves = (square) => {
    if (!square) {
      setValidMoves({});
      return {};
    }

    const moves = game.moves({ square: square, verbose: true });
    const validMovesObj = {};

    moves.forEach(move => {
      validMovesObj[move.to] = {
        backgroundColor: 'rgba(0, 255, 0, 0.3)', // Green highlight for valid moves
      };
    });

    setValidMoves(validMovesObj);
    return validMovesObj;
  };

  const handleHintReceived = (hintData) => {
    setActiveHint(hintData);

    // Clear previous hint highlights
    setHintSquares({});

    // Highlight based on hint type
    if (hintData.hintType === 'bestMove' || hintData.hintType === 'tactical') {
      // For best move or tactical hints, highlight from and to squares
      const newHintSquares = {
        [hintData.from]: { backgroundColor: 'rgba(255, 215, 0, 0.5)' }, // Gold color for from square
      };

      if (hintData.to) {
        newHintSquares[hintData.to] = { backgroundColor: 'rgba(124, 252, 0, 0.5)' }; // Green color for to square
      }

      setHintSquares(newHintSquares);
    }
    else if (hintData.hintType === 'pieceSelection') {
      // For piece selection hints, just highlight the piece to move
      setHintSquares({
        [hintData.fromSquare]: { backgroundColor: 'rgba(255, 215, 0, 0.5)' }
      });
    }

    // Strategic hints don't highlight squares
  };

  // Handle square click for either selecting a piece or making a move
  const handleSquareClick = (square) => {
    if (!gameState.isPlayerTurn || !gameStarted) return;

    // If no square is selected, select the clicked square if it has a piece
    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
        if (showValidMoves) {
          calculateValidMoves(square);
        }
        return;
      }
      return;
    }

    // If a square is already selected, try to make a move
    makeMove(selectedSquare, square);
    setSelectedSquare(null);
    setValidMoves({});
  };

  // Handle piece drop (drag and drop functionality)
  const handlePieceDrop = (sourceSquare, targetSquare) => {
    if (!gameStarted) return false;
    const result = makeMove(sourceSquare, targetSquare);
    setValidMoves({});
    return result;
  };

  // Toggle valid moves display
  const toggleValidMoves = () => {
    setShowValidMoves(!showValidMoves);
    if (!showValidMoves && selectedSquare) {
      calculateValidMoves(selectedSquare);
    } else {
      setValidMoves({});
    }
  };

  // Make the AI move
  const makeAIMove = async (currentGame) => {
    try {
      // Fetch Stockfish move
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_ENGINE_API_URL}evaluate?fen=${encodeURIComponent(currentGame.fen())}&depth=${difficulty}`
      );
      const bestMove = await response.text();

      if (!bestMove || bestMove.length < 4) {
        console.error('Invalid move format from Stockfish:', bestMove);
        toast.error('Stockfish failed to move!', { position: 'top-center', autoClose: 3000, hideProgressBar: true });
        setGameState(prev => ({ ...prev, isPlayerTurn: true, status: 'Your turn' }));
        return;
      }

      // Small delay for UX
      setTimeout(() => {
        const stockfishMove = {
          from: bestMove.substring(0, 2),
          to: bestMove.substring(2, 4),
          promotion: bestMove.length === 5 ? bestMove[4] : undefined
        };

        const stockfishPlayedMove = currentGame.move(stockfishMove);

        if (timeControlEnabled) {
          // The AI just moved, timer switches back to player
          setIsTimerActive(true);
        }

        if (!stockfishPlayedMove) {
          console.error('Invalid Stockfish move:', bestMove);
          setGameState(prev => ({ ...prev, isPlayerTurn: true, status: 'Error: Invalid Stockfish move' }));
          return;
        }

        setGame(new Chess(currentGame.fen()));
        addMoveToHistory(currentGame, `Stockfish: ${stockfishMove.from}-${stockfishMove.to}`);

        // Update last move to include Stockfish move
        const aiMoveText = `Stockfish: ${bestMove.substring(0, 2)}${bestMove.substring(2, 4)}`;
        const lastMoveText = gameState.lastMove ?
          `${gameState.lastMove} | ${aiMoveText}` : aiMoveText;

        // Check for checkmate or draw after Stockfish moves
        let status = 'Your turn';
        if (currentGame.isCheckmate()) {
          status = 'Checkmate! You lost!';
          toast.error('Checkmate! You lost!', { position: 'top-center', autoClose: 3000, hideProgressBar: true });
        } else if (currentGame.isDraw()) {
          status = 'Game drawn!';
          toast.info('Game drawn!', { position: 'top-center', autoClose: 3000, hideProgressBar: true });
        } else if (currentGame.isCheck()) {
          status = 'Check!';
          toast.warning('Check!', { position: 'top-center', autoClose: 2000, hideProgressBar: true });
        }

        setGameState({ isPlayerTurn: true, status, lastMove: lastMoveText });
      }, 2000);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Error getting Stockfish move!', { position: 'top-center', autoClose: 3000, hideProgressBar: true });
      setGameState(prev => ({ ...prev, isPlayerTurn: true, status: 'Your turn' }));
    }
  };

  const makeMove = async (sourceSquare, targetSquare) => {
    if (!gameState.isPlayerTurn) return false;

    try {
      // Validate move
      const possibleMoves = game.moves({ square: sourceSquare, verbose: true });
      const isValidMove = possibleMoves.some(move => move.to === targetSquare);

      if (!isValidMove) {
        toast.error('Invalid move!', { position: 'top-center', autoClose: 2000, hideProgressBar: true });
        return false;
      }

      // Make the player's move
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (!move) return false;

      if (move && timeControlEnabled) {
        // The player just moved, so their timer should pause and bot's should start
        setIsTimerActive(true);
      }

      const newGame = new Chess(game.fen());
      setGame(newGame);

      const playerMoveText = `You: ${sourceSquare}${targetSquare}`;

      addMoveToHistory(newGame, `You: ${sourceSquare}-${targetSquare}`);

      // Check for checkmate or draw before Stockfish moves
      if (newGame.isCheckmate()) {
        toast.success('Checkmate! You won!', { position: 'top-center', autoClose: 3000, hideProgressBar: true });
        setGameState({ ...gameState, status: 'Checkmate! You won.', lastMove: playerMoveText });
        setIsTimerActive(false);
        return true;
      } else if (newGame.isDraw()) {
        toast.info('Game drawn!', { position: 'top-center', autoClose: 3000, hideProgressBar: true });
        setGameState({ ...gameState, status: 'Game drawn!', lastMove: playerMoveText });
        setIsTimerActive(false);
        return true;
      }

      setGameState({
        ...gameState,
        isPlayerTurn: false,
        status: 'Stockfish is thinking...',
        lastMove: playerMoveText
      });

      // Make AI move
      await makeAIMove(newGame);

      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Unexpected error occurred!', { position: 'top-center', autoClose: 3000, hideProgressBar: true });
      setGameState({ ...gameState, isPlayerTurn: true, status: 'Your turn' });
      return false;
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    const newGame = new Chess();
    setGame(newGame);
    setGameState({
      isPlayerTurn: true,
      status: 'Choose your color to start',
      lastMove: null,
    });
    setActiveHint(null);
    setHintSquares({});
    if (hintPanelRef.current) {
      hintPanelRef.current.resetHints();
    }
    setSelectedSquare(null);
    setValidMoves({});
    setMoveHistory([]);
    setIsTimerActive(false);
  };

  // Toggle analysis panel
  const toggleAnalysis = () => {
    setShowAnalysis(!showAnalysis);
    if (!showAnalysis) {
      // Hide move history when showing analysis to avoid cluttering the UI
      setShowMoveHistory(false);
      setShowHints(false);
    }
  };

  const renderHistoryContent = () => {
    if (moveHistory.length === 0) return <p>No moves played yet.</p>;

    switch (historyDisplayType) {
      case 'moves':
        return (
          <div className="h-[36rem] overflow-y-auto">
            {moveHistory.map((historyItem, index) => (
              <div
                key={index}
                className="py-1 border-b border-gray-200 flex items-center"
              >
                <span className="font-medium mr-2">{index}.</span>
                <span>{historyItem.moveText}</span>
              </div>
            ))}
          </div>
        );
      case 'fen':
        return (
          <div className="h-[36rem] overflow-y-auto">
            {moveHistory.map((historyItem, index) => (
              <div
                key={index}
                className="py-1 border-b border-gray-200"
              >
                <div className="font-medium">{index}. {historyItem.moveText}</div>
                <div className="font-mono text-xs break-all bg-gray-100 p-1 mt-1">
                  {historyItem.fen}
                </div>
              </div>
            ))}
          </div>
        );
      case 'pgn':
        const generateCumulativePgn = () => {
          // Create a chess instance to track the game
          const chess = new Chess();

          // Array to store the PGN at each step
          const pgnSteps = ["(Starting position - no moves yet)"];

          // Track move number
          let moveNumber = 1;
          let isWhiteMove = true;

          // Process each move (skip the initial position)
          for (let i = 1; i < moveHistory.length; i++) {
            const moveText = moveHistory[i].moveText;
            // Extract the move coordinates (e.g., "e2-e4" from "Stockfish: e2-e4")
            const moveParts = moveText.split(': ');
            if (moveParts.length > 1) {
              const coords = moveParts[1].split('-');
              if (coords.length === 2) {
                // Try to make the move
                try {
                  const move = chess.move({
                    from: coords[0],
                    to: coords[1],
                    promotion: 'q' // Default promotion to queen
                  });

                  // Get the PGN and clean it
                  const rawPgn = chess.pgn();
                  const cleanPgn = rawPgn.replace(/\[.*?\]\s*/g, '').trim();

                  pgnSteps.push(cleanPgn || `Move ${i}`);
                } catch (error) {
                  console.error("Error recreating move:", error);
                  pgnSteps.push(`(Error with move ${i})`);
                }
              } else {
                pgnSteps.push(`(Invalid move format at step ${i})`);
              }
            } else {
              pgnSteps.push(`(Cannot parse move at step ${i})`);
            }
          }

          return pgnSteps;
        };

        const pgnSteps = generateCumulativePgn();

        return (
          <div className="h-[36rem] overflow-y-auto">
            <h4 className="font-bold mb-2">PGN:</h4>

            {moveHistory.length > 0 && (
              <div className="mb-3 pb-3 border-b border-gray-300">
                <div className="font-mono text-sm bg-gray-100 p-2 mt-1">
                  {pgnSteps[pgnSteps.length - 1] || "(PGN not available)"}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <p>Invalid display type</p>;
    }
  };

  const undoLastMove = () => {
    // Check if there are moves to undo
    if (moveHistory.length <= 1) {
      return;
    }

    try {
      // Create a new game instance and feed it the moves up to the point we want
      const newGame = new Chess();

      // Get all moves except the last two (player's move and Stockfish's response)
      const movesToKeep = moveHistory.slice(0, -2);

      // Apply each move to the new game instance
      for (let i = 1; i < movesToKeep.length; i++) { // Start from 1 to skip initial position
        const moveText = movesToKeep[i].moveText;
        const moveParts = moveText.split(': ');
        if (moveParts.length > 1) {
          const coords = moveParts[1].split('-');
          if (coords.length === 2) {
            try {
              newGame.move({
                from: coords[0],
                to: coords[1],
                promotion: 'q' // Default promotion to queen
              });
            } catch (error) {
              console.error('Error recreating move:', error);
            }
          }
        }
      }

      // Update game state with the new position
      setGame(newGame);

      // Update move history
      setMoveHistory(movesToKeep);

      // Update game state
      setGameState({
        isPlayerTurn: true,
        status: 'Your turn',
        lastMove: null,
      });

      // Reset any selected square or valid moves
      setSelectedSquare(null);
      setValidMoves({});

    } catch (error) {
      console.error('Error undoing moves:', error);
      toast.error('Unable to undo moves!', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 mt-10">
      {!gameStarted ? (

        <div className="flex flex-col items-center gap-2 mb-4">

          <div className='flex flex-wrap gap-10 my-10 w-[80rem]'>
            <div className='flex-1'>
              <h3 className="text-xl font-semibold text-white mb-3 text-center">Game Mode</h3>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setTimeControlEnabled(false)}
                  className={`px-6 py-3 rounded transition-colors font-medium ${!timeControlEnabled
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-black hover:bg-gray-300'
                    }`}
                >
                  Standard (No Timer)
                </button>
                <button
                  onClick={() => {
                    setTimeControlEnabled(true);
                    setShowTimeControlSelector(true);
                  }}
                  className={`px-6 py-3 rounded transition-colors font-medium ${timeControlEnabled
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-black hover:bg-gray-300'
                    }`}
                >
                  Timed Game
                </button>
              </div>

              {timeControlEnabled && timeControl && (
                <div className="text-center text-gray-900 bg-blue-50 p-2 rounded mb-4">
                  <span className="font-semibold">Selected Time Control: </span>
                  <span>{timeControl.name} - {timeControl.description}</span>
                </div>
              )}
            </div>

            <div className='flex-1'>
              <h3 className="text-xl text-white font-semibold mb-3 text-center">Select Difficulty</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {difficultyOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setDifficulty(option.value)}
                    className={`px-6 py-3 rounded transition-colors font-medium ${difficulty === option.value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-black hover:bg-gray-300'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className='flex gap-1 justify-between text-white'>
                <div className='flex-1'>Current Difficulty : <span className='text-green-300'> {difficulty}</span></div>
                <button
                  onClick={() => {
                    setCustomDifficulty(difficulty);
                    setShowDifficultySlider(true);
                  }}
                  className="flex-1 text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Set Custom Difficulty →
                </button>
              </div>
            </div>

            <div className='flex flex-col flex-1'>
              <h3 className="text-xl font-semibold mb-3 text-white text-center">Select Hint Limit</h3>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[1, 3, 5, 7, "∞"].map(limit => (
                  <button
                    key={limit}
                    onClick={() => setSelectedHintLimit(limit === "∞" ? Number.POSITIVE_INFINITY : limit)}
                    className={`px-4 py-2 rounded transition-colors font-medium ${selectedHintLimit === (limit === "∞" ? Number.POSITIVE_INFINITY : limit)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                  >
                    {limit}
                  </button>
                ))}
              </div>
              <div className="w-lg">
                <p className="text-center text-gray-100 text-sm">
                  {selectedHintLimit === -1
                    ? "You'll have unlimited hints during the game"
                    : `You'll have ${selectedHintLimit} hint${selectedHintLimit !== 1 ? 's' : ''} during the game`
                  }
                </p>
              </div>
            </div>
          </div>

          <div className={`fixed right-0 top-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-10 ${showDifficultySlider ? 'translate-x-0' : 'translate-x-full'}`} style={{ width: '24rem' }}>
            <div className="p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Custom Difficulty</h3>
                <button
                  onClick={() => setShowDifficultySlider(false)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <label className="block mb-2 font-medium text-gray-900">Engine Depth: <span className="text-black">{customDifficulty}</span></label>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={customDifficulty}
                  onChange={handleCustomDifficultyChange}
                  className="w-full h-1 bg-gray-200 rounded-sm appearance-none cursor-pointer custom-slider"
                />

                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Easy (1)</span>
                  <span>Hard (25)</span>
                </div>
              </div>

              <div className="text-sm text-slate-800 my-6">
                <p className="mb-2"><strong>Engine Depth Explanation:</strong></p>
                <p className="mb-2">Higher depth values make Stockfish search deeper and play stronger, but calculations take longer.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>1-5: Beginner level, quick responses</li>
                  <li>6-12: Intermediate level</li>
                  <li>13-18: Advanced level</li>
                  <li>19-25: Expert/Master level</li>
                </ul>
              </div>

              <button
                onClick={applyCustomDifficulty}
                className="w-full py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition-colors"
              >
                Apply Custom Difficulty
              </button>
            </div>
          </div>


          <h2 className="text-2xl font-semibold text-white">Choose your color</h2>
          <div className="flex gap-4">
            <button
              onClick={() => startGame('w')}
              className="px-6 py-3 text-gray-900 bg-white rounded hover:bg-gray-200 transition-colors text-lg"
            >
              Play as White
            </button>
            <button
              onClick={() => startGame('b')}
              className="px-6 py-3 bg-black border border-white text-white rounded hover:bg-[#101010] transition-colors font-bold text-lg"
            >
              Play as Black
            </button>
          </div>
          <div className="mt-6 w-full max-w-md">
            <StockfishStatus key="stockfish-status" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className='flex w-full px-2 items-center justify-evenly gap-8'>
            <div className='flex gap-4'>
              <div className='flex flex-col flex-1 text-white'>
                <h2 className="text-2xl font-bold">{gameState.status}</h2>
                <div className="text-lg">
                  Playing as: {playerColor === 'w' ? 'White' : 'Black'}
                </div>
                <div className="text-lg mb-3">
                  Difficulty: {getCurrentDifficultyLabel()} + {difficulty}
                </div>
              </div>
            </div>
            <div className='flex'>

              {timeControlEnabled && (
                <GameTimer
                  isActive={isTimerActive}
                  onTimeUp={handleTimeUp}
                  initialTime={timeControl?.time || 300}
                  increment={timeControl?.increment || 0}
                  playerColor={playerColor}
                  currentTurn={game.turn()}
                />
              )}

            </div>
            <div className="flex gap-4 flex-wrap mb-4">
              <button
                onClick={toggleValidMoves}
                className="px-4 py-2 h-10 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
              >
                {showValidMoves ? 'Hide Valid Moves' : 'Show Valid Moves'}
              </button>
              <button
                onClick={resetGame}
                className="px-4 py-2 h-10 text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
              >
                New Game
              </button>
              <button
                onClick={undoLastMove}
                // Disable the button if there are no moves to undo
                disabled={moveHistory.length <= 1}
                className={`px-4 py-2 h-10 text-white rounded transition-colors ${moveHistory.length <= 1
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
              >
                Undo Move
              </button>
              <button
                onClick={toggleAnalysis}
                className="px-4 py-2 h-10 text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors"
              >
                {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
              </button>

              <button
                onClick={toggleMoveHistory}
                className="px-4 py-2 h-10 text-white bg-purple-500 rounded hover:bg-purple-600 transition-colors"
              >
                {showMoveHistory ? 'Hide Move History' : 'Show Move History'}
              </button>

              <button
                onClick={toggleHints}
                className='px-4 py-2 h-10 text-white bg-purple-500 rounded hover:bg-purple-600 transition-colors'
              >
                {showHints ? 'Hide Hints' : 'Show Hints'}
              </button>
            </div>
          </div>
          <div className='flex w-[100vw] flex-wrap px-4'>
            <div className='flex-1 flex flex-col'>
              <CustomChessboard
                fen={game.fen()}
                selectedSquare={selectedSquare}
                onSquareClick={handleSquareClick}
                onPieceDrop={handlePieceDrop}
                boardOrientation={playerColor === 'w' ? 'white' : 'black'}
                customSquareStyles={{
                  ...(selectedSquare && {
                    [selectedSquare]: {
                      backgroundColor: 'rgba(255, 255, 0, 0.4)',
                    },
                  }),
                  ...validMoves,
                  ...hintSquares
                }}
              />
            </div>
            {showAnalysis && (<div className='flex-1 text-center'>
              <div className="mt-6 w-full flex gap-4">
                <GameAnalysis
                  moveHistory={moveHistory}
                  game={game}
                  difficulty={difficulty}
                  playerColor={playerColor}
                />
              </div>
            </div>
            )}

            {
              showHints &&
              <div className='flex flex-1 flex-col'>

                {gameStarted && (
                  <div className="mt-4 w-full max-w-md">
                    <HintPanel
                      ref={hintPanelRef}
                      game={game}
                      difficulty={difficulty}
                      isPlayerTurn={gameState.isPlayerTurn}
                      onHintReceived={handleHintReceived}
                      hints={selectedHintLimit}
                    />
                  </div>
                )}

                {activeHint && (
                  <div className="w-full max-w-md mt-4 text-gray-900">
                    <ActiveHint hintData={activeHint} />
                  </div>
                )}

              </div>
            }
            {showMoveHistory && (
              <div className="flex flex-1 flex-col text-gray-900 items-center w-full mb-4">
                <div className="w-full h-full bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between mb-3">
                    <h3 className="font-bold text-lg">Move History</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => changeHistoryDisplayType('moves')}
                        className={`px-2 py-1 text-xs rounded ${historyDisplayType === 'moves'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        Moves
                      </button>
                      <button
                        onClick={() => changeHistoryDisplayType('fen')}
                        className={`px-2 py-1 text-xs rounded ${historyDisplayType === 'fen'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        FEN
                      </button>
                      <button
                        onClick={() => changeHistoryDisplayType('pgn')}
                        className={`px-2 py-1 text-xs rounded ${historyDisplayType === 'pgn'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        PGN
                      </button>
                    </div>
                  </div>

                  {renderHistoryContent()}

                  <div className="mt-3 text-xs text-gray-500">
                    Total moves: {moveHistory.length - 1}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      <ToastContainer />
      <TimeControlSelector
        onSelectTimeControl={handleTimeControlSelection}
        onCancel={() => setShowTimeControlSelector(false)}
        showTimeControl={showTimeControlSelector}
      />
    </div>
  );
};

export default ChessGame;