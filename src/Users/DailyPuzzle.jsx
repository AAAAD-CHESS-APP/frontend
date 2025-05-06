import React, { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import {
  FiRefreshCw,
  FiHelpCircle,
  FiArrowLeft,
  FiAward,
  FiInfo,
  FiCalendar,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "./DashboardNabvar";
import { fetchDailyPuzzle } from "../services/apiFunctions";

export default function DailyPuzzle() {
  const navigate = useNavigate();
  const [game, setGame] = useState(new Chess());
  const [puzzleData, setPuzzleData] = useState(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [currentDate, setCurrentDate] = useState("");

  // Set current date in nice format
  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  // Custom chess pieces to match your other chess boards
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

  // Fetch puzzle data
  const fetchPuzzleData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch puzzle data
      const response = await fetchDailyPuzzle();

      if (!response.success) {
        setError(response.message || "Failed to load puzzle");
        toast.error("Could not load puzzle");
        return;
      }

      const puzzleData = response.data;
      setPuzzleData(puzzleData);

      // Parse the PGN to get to the position
      const chess = new Chess();

      // Process the initial position
      if (puzzleData.game && puzzleData.game.pgn) {
        const moves = puzzleData.game.pgn.split(" ");

        for (let i = 0; i < moves.length; i++) {
          try {
            chess.move(moves[i]);
          } catch (e) {
            // Skip invalid moves
            console.warn("Skipping invalid move:", moves[i]);
          }
        }

        // Set board orientation
        const orientation = chess.turn() === "w" ? "white" : "black";
        setBoardOrientation(orientation);
      }

      setGame(chess);
      setMoveIndex(0);
      setPuzzleSolved(false);
      setShowSolution(false);

      // Check if we've already solved this puzzle today
      const savedPuzzleState = localStorage.getItem("dailyPuzzleState");
      if (savedPuzzleState) {
        try {
          const { puzzleId, solved } = JSON.parse(savedPuzzleState);
          if (puzzleId === puzzleData.puzzle.id && solved) {
            setPuzzleSolved(true);
            toast.success("You've already solved today's puzzle!");
          }
        } catch (e) {
          console.error("Error parsing saved puzzle state:", e);
        }
      }
    } catch (err) {
      console.error("Error fetching puzzle:", err);
      setError("Failed to load puzzle. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPuzzleData();
  }, [fetchPuzzleData]);

  const makeMove = (move) => {
    try {
      const newGame = new Chess(game.fen());
      const result = newGame.move(move);

      if (result) {
        setGame(newGame);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Invalid move:", error);
      return false;
    }
  };
  const onDrop = (sourceSquare, targetSquare) => {
    if (puzzleSolved || showSolution) return false;

    const pieceType = game.get(sourceSquare)?.type;
    const isLastRank =
      targetSquare.charAt(1) === "8" || targetSquare.charAt(1) === "1";

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: pieceType === "p" && isLastRank ? "q" : undefined,
    };

    // Try to make the user's move
    const newGame = new Chess(game.fen());
    const moveResult = newGame.move(move);

    if (!moveResult) return false;

    // User move was legal, now check if it matches the expected puzzle move
    if (
      puzzleData?.puzzle?.solution &&
      puzzleData.puzzle.solution.length > moveIndex
    ) {
      const expectedMove = puzzleData.puzzle.solution[moveIndex];
      const userMove = sourceSquare + targetSquare;

      // Check if user move matches expected move pattern (ignoring promotion)
      const moveMatches = userMove === expectedMove.substring(0, 4);

      if (moveMatches) {
        // User made the correct move, update state
        setGame(newGame);
        setMoveIndex(moveIndex + 1);

        if (moveIndex + 1 >= puzzleData.puzzle.solution.length) {
          // This was the last move, puzzle is solved
          setPuzzleSolved(true);
          const puzzleState = {
            puzzleId: puzzleData.puzzle.id,
            solved: true,
            date: new Date().toISOString().split("T")[0],
          };
          localStorage.setItem("dailyPuzzleState", JSON.stringify(puzzleState));
          toast.success("Puzzle solved! Well done!");
        } else {
          // Try to make the computer's move after a slight delay
          setTimeout(() => {
            try {
              // Get the computer's move from the solution
              const computerMove = puzzleData.puzzle.solution[moveIndex + 1];
              const from = computerMove.substring(0, 2);
              const to = computerMove.substring(2, 4);

              // Create a new game instance from current position
              const computerGame = new Chess(newGame.fen());

              // Check if the computer move is valid
              const validMoves = computerGame.moves({ verbose: true });
              const isValidComputerMove = validMoves.some(
                (m) => m.from === from && m.to === to
              );

              if (!isValidComputerMove) {
                console.warn(
                  `Computer move ${from}-${to} is not valid in current position`
                );
                console.log("Current FEN:", computerGame.fen());
                console.log(
                  "Valid moves:",
                  validMoves.map((m) => `${m.from}-${m.to}`)
                );

                // Try to find an alternative move that works
                let alternativeMoveFound = false;

                // Look for any piece that can move to the target square
                for (const m of validMoves) {
                  if (m.to === to) {
                    computerGame.move(m);
                    alternativeMoveFound = true;
                    console.log(`Used alternative move: ${m.from}-${m.to}`);
                    break;
                  }
                }

                if (!alternativeMoveFound) {
                  // Just make any legal move if specific move can't be found
                  if (validMoves.length > 0) {
                    computerGame.move(validMoves[0]);
                    console.log(
                      `Used fallback move: ${validMoves[0].from}-${validMoves[0].to}`
                    );
                  } else {
                    console.error("No legal moves available");
                  }
                }
              } else {
                // The computer move is valid, make it
                const moveObj = {
                  from,
                  to,
                  promotion:
                    computerGame.get(from)?.type === "p" &&
                    (to.charAt(1) === "8" || to.charAt(1) === "1")
                      ? "q"
                      : undefined,
                };

                computerGame.move(moveObj);
              }

              // Update the game state with the computer's move
              setGame(computerGame);
              setMoveIndex(moveIndex + 2);
            } catch (error) {
              console.error("Error making computer move:", error);
              // Skip to next user move
              setMoveIndex(moveIndex + 2);
            }
          }, 500);
        }

        return true;
      } else {
        // Incorrect move
        toast.error("Incorrect move. Try again.");

        // Reset to the position before the move
        setTimeout(() => {
          resetPuzzle(true);
        }, 500);

        return true;
      }
    }

    // If we get here, just accept the move
    setGame(newGame);
    return true;
  };

  const resetPuzzle = (skipToast = false) => {
    if (!puzzleData) return;

    const chess = new Chess();

    if (puzzleData.game && puzzleData.game.pgn) {
      const moves = puzzleData.game.pgn.split(" ");

      for (let i = 0; i < moves.length; i++) {
        try {
          chess.move(moves[i]);
        } catch (e) {
          console.warn("Skipping invalid move:", moves[i]);
        }
      }
    }

    setGame(chess);
    setMoveIndex(0);
    setPuzzleSolved(false);
    setShowSolution(false);

    // Only show toast if not skipped
    if (!skipToast) {
      toast("Puzzle reset", {
        icon: "🔄",
        style: {
          backgroundColor: "#f0f9ff",
          color: "#0369a1",
        },
      });
    }
  };

  const viewSolution = () => {
    if (!puzzleData) return;

    resetPuzzle(true); // Skip toast notification
    setShowSolution(true);

    const solutionMoves = puzzleData.puzzle.solution;
    let currentGame = new Chess(game.fen());
    let moveDelay = 1000;

    const playSolution = (index) => {
      if (index >= solutionMoves.length) {
        toast.success("Solution completed!");
        return;
      }

      const move = solutionMoves[index];
      const from = move.substring(0, 2);
      const to = move.substring(2, 4);

      setTimeout(() => {
        try {
          // Get the piece at the from position
          const piece = currentGame.get(from);

          // Check if the move is valid before attempting it
          const isValidMove = currentGame
            .moves({
              square: from,
              verbose: true,
            })
            .some((move) => move.to === to);

          if (!isValidMove) {
            console.error(
              `Invalid solution move from ${from} to ${to}. Skipping.`
            );
            // Continue to next move
            playSolution(index + 1);
            return;
          }

          // Create move object without promotion by default
          const moveObj = {
            from: from,
            to: to,
          };

          // Only add promotion for pawns moving to the last rank
          if (
            piece &&
            piece.type === "p" &&
            (to.charAt(1) === "8" || to.charAt(1) === "1")
          ) {
            moveObj.promotion = "q";
          }

          // Execute the move
          currentGame.move(moveObj);
          setGame(new Chess(currentGame.fen()));

          // Continue to next move
          playSolution(index + 1);
        } catch (e) {
          console.error(
            "Invalid solution move:",
            e,
            "at index",
            index,
            "move:",
            move
          );
          // Try to continue with the next move
          playSolution(index + 1);
        }
      }, moveDelay);
    };

    setTimeout(() => playSolution(0), 500);
  };

  const getPuzzleDescription = () => {
    if (!puzzleData || !puzzleData.puzzle)
      return "Find the best move in this position";
    const themes = puzzleData.puzzle.themes || [];
    if (themes.includes("mate")) {
      return "Find the checkmate sequence";
    } else if (themes.includes("mateIn2")) {
      return "Find the mate in 2 moves";
    } else if (themes.includes("mateIn3")) {
      return "Find the mate in 3 moves";
    } else if (themes.includes("fork")) {
      return "Find the fork that wins material";
    } else if (themes.includes("pin")) {
      return "Find the pin that creates an advantage";
    } else if (themes.includes("sacrifice")) {
      return "Find the winning sacrifice";
    } else if (themes.includes("defensiveSacrifice")) {
      return "Find the defensive sacrifice";
    } else if (themes.includes("tactical")) {
      return "Find the tactical shot that wins material";
    } else if (themes.includes("advantage")) {
      return "Find the move that gives a decisive advantage";
    } else if (themes.includes("opening")) {
      return "Find the best opening move";
    } else if (themes.length > 0) {
      return `Find the best ${themes[0]} move`;
    }

    return "Find the best move in this position";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={() => navigate("/dashboard-pannel")}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <DashboardNavbar />
      <div className="flex-1 pt-24 px-4 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with back button */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => navigate("/dashboard-pannel")}
                  className="text-gray-600 hover:text-black flex items-center gap-1.5 transition-colors"
                >
                  <FiArrowLeft className="text-lg" />
                  <span>Back to Dashboard</span>
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Daily Chess Puzzle
              </h1>
              <div className="flex items-center gap-2 mt-1 text-gray-500">
                <FiCalendar />
                <span>{currentDate}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Chessboard */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Puzzle description */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {getPuzzleDescription()}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {boardOrientation === "white" ? "White" : "Black"} to move
                  </p>
                </div>

                {/* Chessboard */}
                <div className="p-4 md:p-6">
                  <div className="aspect-square max-w-2xl mx-auto">
                    <Chessboard
                      position={game.fen()}
                      onPieceDrop={onDrop}
                      boardOrientation={boardOrientation}
                      areArrowsAllowed
                      customPieces={customPieces}
                      customDarkSquareStyle={{
                        backgroundColor: "#888c95",
                      }}
                      customLightSquareStyle={{
                        backgroundColor: "#efeceb",
                      }}
                      customBoardStyle={{
                        borderRadius: "0.375rem",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                      showBoardNotation={true}
                    />
                  </div>
                </div>

                {/* Control buttons */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3 justify-center md:justify-start">
                  <button
                    onClick={resetPuzzle}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md shadow-sm transition-colors"
                  >
                    <FiRefreshCw className="text-gray-500" />
                    <span>Reset Puzzle</span>
                  </button>

                  <button
                    onClick={viewSolution}
                    disabled={showSolution}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-md shadow-sm transition-colors ${
                      showSolution
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800 border border-gray-700"
                    }`}
                  >
                    <FiHelpCircle
                      className={showSolution ? "text-gray-400" : "text-white"}
                    />
                    <span>
                      {showSolution ? "Showing Solution..." : "Show Solution"}
                    </span>
                  </button>
                </div>

                {/* Success message */}
                {puzzleSolved && (
                  <div className="px-6 py-4 bg-green-50 border-t border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-green-100 p-2 mt-0.5">
                        <FiAward className="text-green-600 text-lg" />
                      </div>
                      <div>
                        <h3 className="font-bold text-green-800">
                          Puzzle Solved!
                        </h3>
                        <p className="text-green-700 mt-1">
                          Congratulations! You've successfully solved today's
                          puzzle.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Puzzle information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Puzzle Information */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FiInfo className="text-gray-500" />
                    <span>Puzzle Information</span>
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </h3>
                    <p className="mt-1 font-medium text-gray-900">
                      {puzzleData && puzzleData.puzzle.rating
                        ? `Rating: ${puzzleData.puzzle.rating}`
                        : "Medium"}
                    </p>
                  </div>

                  {puzzleData && puzzleData.puzzle.plays && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Popularity
                      </h3>
                      <p className="mt-1 font-medium text-gray-900">
                        Solved by {puzzleData.puzzle.plays.toLocaleString()}{" "}
                        players
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Themes */}
              {puzzleData &&
                puzzleData.puzzle.themes &&
                puzzleData.puzzle.themes.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Themes
                      </h2>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {puzzleData.puzzle.themes.map((theme, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full capitalize"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">
                    How to Play
                  </h2>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-black font-bold">1.</span>
                      <span>Find the best move in the given position</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black font-bold">2.</span>
                      <span>
                        Continue the correct sequence to solve the puzzle
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black font-bold">3.</span>
                      <span>Reset the puzzle if you make a mistake</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black font-bold">4.</span>
                      <span>Use "Show Solution" if you're stuck</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
