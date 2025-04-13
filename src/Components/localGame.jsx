import { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import ScrollToBottom from 'react-scroll-to-bottom';
import { FiRefreshCw, FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight, FiEye, FiEyeOff } from "react-icons/fi";

function LocalGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(() => {
    if (sessionStorage.getItem("localgame")) return new Chess(sessionStorage.getItem("localgame"));
    return new Chess();
  });

  const customPieces = {
    wP: ({ squareWidth }) => (
      <img
        src="/assets/pieces/wp.png"
        alt="White Pawn"
        style={{ width: squareWidth, height: squareWidth }}
      />
    ),
    wR: ({ squareWidth }) => (
      <img
        src="/assets/pieces/wr.png"
        alt="White Rook"
        style={{ width: squareWidth, height: squareWidth }}
      />
    ),
    wN: ({ squareWidth }) => (
      <img
        src="/assets/pieces/wn.png"
        alt="White Knight"
        style={{ width: squareWidth, height: squareWidth }}
      />
    ),
    wB: ({ squareWidth }) => (
      <img
        src="/assets/pieces/wb.png"
        alt="White Bishop"
        style={{ width: squareWidth, height: squareWidth }}
      />
    ),
    wQ: ({ squareWidth }) => (
      <img
        src="/assets/pieces/wq.png"
        alt="White Queen"
        style={{ width: squareWidth, height: squareWidth }}
      />
    ),
    wK: ({ squareWidth }) => (
      <img
        src="/assets/pieces/wk.png"
        alt="White King"
        style={{ width: squareWidth, height: squareWidth }}
      />
    ),
    bP: ({ squareWidth }) => (
      <img
        src="/assets/pieces/bp.png"
        alt="Black Pawn"
        style={{ width: squareWidth, height: squareWidth }}
      />
    ),
    bR: ({ squareWidth }) => (
      <img
        src="/assets/pieces/br.png"
        alt="Black Rook"
        style={{ width: squareWidth, height: squareWidth }}
      />
    ),
    bN: ({ squareWidth }) => (
      <img
        src="/assets/pieces/bn.png"
        alt="Black Knight"
        style={{ width: squareWidth, height: squareWidth }}
      />
    ),
    bB: ({ squareWidth }) => (
      <img
        src="/assets/pieces/bb.png"
        alt="Black Bishop"
        style={{ width: squareWidth, height: squareWidth }}
      />
    ),
    bQ: ({ squareWidth }) => (
      <img
        src="/assets/pieces/bq.png"
        alt="Black Queen"
        style={{ width: squareWidth, height: squareWidth }}
      />
    ),
    bK: ({ squareWidth }) => (
      <img
        src="/assets/pieces/bk.png"
        alt="Black King"
        style={{ width: squareWidth, height: squareWidth }}
      />
    ),
  };

  const [player, setPlayer] = useState("white");
  const [boardWidth, setBoardWidth] = useState(600);
  const [fen, setFen] = useState(game.fen());
  const location = useLocation();
  const { player1, player2, timeControl } = location.state || {
    player1: 'Player 1',
    player2: 'Player 2',
    timeControl: 'infinity'
  };

  const [fens, setFens] = useState([]);
  const [pgns, setPgns] = useState([]);
  const [activeTab, setActiveTab] = useState("pgn");
  const boardContainerRef = useRef(null);
  
  // New states for valid moves and click to move functionality
  const [showValidMoves, setShowValidMoves] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState({});

  // Modified timer states to check sessionStorage first
  const [whiteTime, setWhiteTime] = useState(() => {
    const savedTime = sessionStorage.getItem("whiteTime");
    if (savedTime) return parseInt(savedTime);
    return timeControl === "infinity" ? Infinity : parseInt(timeControl) * 60;
  });

  const [blackTime, setBlackTime] = useState(() => {
    const savedTime = sessionStorage.getItem("blackTime");
    if (savedTime) return parseInt(savedTime);
    return timeControl === "infinity" ? Infinity : parseInt(timeControl) * 60;
  });

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Responsive board sizing
  useEffect(() => {
    const handleResize = () => {
      if (boardContainerRef.current) {
        const containerWidth = boardContainerRef.current.offsetWidth;
        setBoardWidth(Math.min(600, containerWidth - 40));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modified timer effect to store times
  useEffect(() => {
    if (isTimerRunning && whiteTime !== Infinity && blackTime !== Infinity) {
      timerRef.current = setInterval(() => {
        if (player === "white") {
          setWhiteTime(prev => {
            const newTime = prev <= 0 ? 0 : prev - 1;
            sessionStorage.setItem("whiteTime", newTime);
            if (newTime <= 0) {
              clearInterval(timerRef.current);
              toast.success("Black wins on time!");
              resetBoard();
            }
            return newTime;
          });
        } else {
          setBlackTime(prev => {
            const newTime = prev <= 0 ? 0 : prev - 1;
            sessionStorage.setItem("blackTime", newTime);
            if (newTime <= 0) {
              clearInterval(timerRef.current);
              toast.success("White wins on time!");
              resetBoard();
            }
            return newTime;
          });
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [player, isTimerRunning]);

  useEffect(() => {
    const storedGameId = sessionStorage.getItem("local-gameId");
    if (storedGameId != gameId) {
      resetSessionStorage();
    }
    sessionStorage.setItem("local-gameId", gameId);
    sessionStorage.setItem("timeControl", timeControl || "infinity");

    const Fens = sessionStorage.getItem("local-fens");
    const Pgns = sessionStorage.getItem("local-pgns");

    if (Fens) setFens(JSON.parse(Fens));
    if (Pgns) setPgns(JSON.parse(Pgns));
    if (sessionStorage.getItem("localplayer")) setPlayer(sessionStorage.getItem("localplayer"));
  }, []);

  const formatTime = (seconds) => {
    if (seconds === Infinity) return "∞";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  // Toggle valid moves display
  const toggleValidMoves = () => {
    setShowValidMoves(!showValidMoves);
    if (!showValidMoves && selectedSquare) {
      calculateValidMoves(selectedSquare);
    } else {
      setValidMoves({});
      setSelectedSquare(null);
    }
  };

  // Handle square click for either selecting a piece or making a move
  const handleSquareClick = (square) => {
    // If no square is selected, select the clicked square if it has a piece
    if (!selectedSquare) {
      const piece = game.get(square);
      const isCurrentPlayerPiece = (player === "white" && piece?.color === "w") || 
                                   (player === "black" && piece?.color === "b");
                                   
      if (piece && isCurrentPlayerPiece) {
        setSelectedSquare(square);
        if (showValidMoves) {
          calculateValidMoves(square);
        }
        return;
      }
      return;
    }

    // If a square is already selected, try to make a move
    const move = game.move({
      from: selectedSquare,
      to: square,
      promotion: game.get(selectedSquare)?.type === 'p' &&
        (square[1] === '8' || square[1] === '1') ? 'q' : undefined
    });

    if (move) {
      handleSuccessfulMove(move);
    }
    
    setSelectedSquare(null);
    setValidMoves({});
  };

  // Handle successful move (common code for both onDrop and handleSquareClick)
  const handleSuccessfulMove = (move) => {
    setIsTimerRunning(true);
    // Store current times
    if (whiteTime !== Infinity) {
      sessionStorage.setItem("whiteTime", whiteTime);
      sessionStorage.setItem("blackTime", blackTime);
    }

    setGame(new Chess(game.fen()));
    if (game.isCheckmate()) {
      const winner = move.color === "w" ? "White" : "Black";
      toast.success(`${winner} wins by checkmate!`);
      resetBoard();
    } else if (game.isStalemate()) {
      toast.error("It's a stalemate! Game Over.");
      resetBoard();
    } else if (game.isDraw()) {
      toast.error("It's a draw! Game Over.");
      resetBoard();
    }

    if (player == "white") {
      setPlayer("black");
      sessionStorage.setItem("localplayer", "black");
    } else {
      setPlayer("white");
      sessionStorage.setItem("localplayer", "white");
    }
    setFen(game.fen());
    setFens(prevFens => {
      const updatedFens = [...prevFens, game.fen()];
      sessionStorage.setItem("local-fens", JSON.stringify(updatedFens));
      return updatedFens;
    });

    setPgns(prevPgns => {
      const updatedPgns = [...prevPgns, game.pgn()];
      sessionStorage.setItem("local-pgns", JSON.stringify(updatedPgns));
      return updatedPgns;
    });

    sessionStorage.setItem("localgame", game.fen());
  };

  // Modified onDrop function to use common handleSuccessfulMove function
  const onDrop = (sourceSquare, targetSquare) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: game.get(sourceSquare)?.type === 'p' &&
        (targetSquare[1] === '8' || targetSquare[1] === '1') ? 'q' : undefined
    });

    if (move) {
      handleSuccessfulMove(move);
      return true;
    }
    return false;
  };

  // Modified resetSessionStorage to include time removal
  function resetSessionStorage() {
    sessionStorage.removeItem("localgame");
    sessionStorage.removeItem("local-fens");
    sessionStorage.removeItem("local-pgns");
    sessionStorage.removeItem("localplayer");
    sessionStorage.removeItem("whiteTime");
    sessionStorage.removeItem("blackTime");
  }

  // Modified resetBoard function to handle time reset
  function resetBoard() {
    setGame(new Chess());
    setPlayer("white");
    resetSessionStorage();
    setFens([]);
    setPgns([]);
    setIsTimerRunning(false);
    clearInterval(timerRef.current);
    const initialTime = timeControl === "infinity" ? Infinity : parseInt(timeControl) * 60;
    setWhiteTime(initialTime);
    setBlackTime(initialTime);
    // Store initial times
    if (initialTime !== Infinity) {
      sessionStorage.setItem("whiteTime", initialTime);
      sessionStorage.setItem("blackTime", initialTime);
    }
    
    // Reset move highlighting
    setSelectedSquare(null);
    setValidMoves({});
  }

  // Navigate back to localGamePage
  function backToSetup() {
    navigate('/localgamePage');
  }

  // Format PGN for display
  const formatPgn = (pgn) => {
    return pgn
      .split('\n')
      .filter(line => !line.startsWith('['))
      .join(' ')
      .replace(/\*/g, '')
      .replace(/\.\.\./g, '')
      .trim();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/bg1.jpg")' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-8xl mx-auto">
          <div className="p-4 bg-black text-white flex justify-between items-center">
            <h1 className="text-xl font-semibold">Local Chess Game</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={backToSetup}
                className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
              >
                Back to Setup
              </button>
              <button
                onClick={toggleValidMoves}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 
                  ${showValidMoves 
                    ? 'bg-blue-700 hover:bg-blue-800' 
                    : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                {showValidMoves ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                {showValidMoves ? 'Hide Valid Moves' : 'Show Valid Moves'}
              </button>
              <button
                onClick={resetBoard}
                className="px-3 py-1.5 text-sm bg-red-900 hover:bg-red-800 rounded-md transition-colors flex items-center gap-1"
              >
                <FiRefreshCw size={14} />
                Reset Game
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row bg-gray-900">
            {/* Main chess board area */}
            <div className="lg:w-2/3 p-6 bg-black" ref={boardContainerRef}>
              {/* Player info and timers */}
              <div className="flex justify-between items-center mb-4">
                <div className={`flex-1 px-4 py-2 rounded-lg ${player === 'white' && isTimerRunning
                  ? 'bg-gray-800 border-2 border-gray-600'
                  : 'bg-gray-800'
                  }`}>
                  <div className="font-semibold text-white">{player1} (White)</div>
                  <div className={`text-2xl font-mono ${whiteTime < 30 && whiteTime !== Infinity ? 'text-red-400' : 'text-white'}`}>
                    {formatTime(whiteTime)}
                  </div>
                </div>

                <div className="mx-2 text-gray-500">vs</div>

                <div className={`flex-1 px-4 py-2 rounded-lg ${player === 'black' && isTimerRunning
                  ? 'bg-gray-800 border-2 border-gray-600'
                  : 'bg-gray-800'
                  }`}>
                  <div className="font-semibold text-white">{player2} (Black)</div>
                  <div className={`text-2xl font-mono ${blackTime < 30 && blackTime !== Infinity ? 'text-red-400' : 'text-white'}`}>
                    {formatTime(blackTime)}
                  </div>
                </div>
              </div>

              {/* Chessboard */}
              <div className="flex justify-center items-center w-full">
                <div className="w-full max-w-[600px] mx-auto">
                  <Chessboard
                    id="localBoard"
                    position={game.fen()}
                    onPieceDrop={onDrop}
                    onSquareClick={handleSquareClick}
                    autoPromoteToQueen={true}
                    boardWidth={boardWidth}
                    customBoardStyle={{
                      borderRadius: "0.25rem",
                      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
                      margin: "0 auto",
                    }}
                    customDarkSquareStyle={{
                      backgroundColor: "#888c95",
                    }}
                    customLightSquareStyle={{
                      backgroundColor: "#efeceb",
                    }}
                    customPieces={customPieces}
                    showBoardNotation={true}
                    customSquareStyles={{
                      ...(selectedSquare && {
                        [selectedSquare]: {
                          backgroundColor: 'rgba(255, 255, 0, 0.4)', // Highlight selected square
                        },
                      }),
                      ...validMoves,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 text-center text-gray-300">
                {player === 'white' ? `${player1}'s turn (White)` : `${player2}'s turn (Black)`}
                {selectedSquare && (
                  <span className="ml-2 text-yellow-300">
                    Selected piece at {selectedSquare.toUpperCase()} - click a destination square
                  </span>
                )}
              </div>
            </div>

            {/* Move history sidebar */}
            <div className="lg:w-1/3 bg-black border-l border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg flex items-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Move History
                  </h3>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab("pgn")}
                    className={`px-2 py-1 text-md rounded transition-colors ${activeTab === 'pgn'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                  >
                    Moves
                  </button>
                  <button
                    onClick={() => setActiveTab("fen")}
                    className={`px-2 py-1 text-md rounded transition-colors ${activeTab === 'fen'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                  >
                    FEN
                  </button>
                </div>
              </div>

              <div className="h-[calc(100%-75px)] overflow-auto">
                {activeTab === "pgn" ? (
                  <div className="p-4">
                    {pgns.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {pgns.map((pgn, idx) => (
                          <div key={idx} className="flex items-center p-2 border-b border-gray-700">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${idx % 2 === 0 ? 'bg-gray-700 text-white' : 'bg-gray-600 text-white'
                              }`}>
                              {Math.floor(idx / 2) + 1}
                            </div>
                            <span className="font-mono text-sm text-gray-200 font-medium">
                              {formatPgn(pgn).replace(/^\d+\.\s/, '')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No moves made yet
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4">
                    {fens.length > 0 ? (
                      fens.map((fen, idx) => (
                        <div key={idx} className="mb-2 p-2 bg-gray-700 rounded text-xs font-mono text-gray-300 overflow-x-auto">
                          {fen}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No positions recorded yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocalGame;