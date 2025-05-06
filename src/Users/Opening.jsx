import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiBookOpen, FiInfo, FiHelpCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from './DashboardNabvar';

export default function Opening() {
  const navigate = useNavigate();
  const [selectedOpeningIndex, setSelectedOpeningIndex] = useState(0);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [game, setGame] = useState(new Chess());

  // Collection of important openings with explanations
  const openings = [
    {
      name: "Ruy Lopez (Spanish Opening)",
      eco: "C60-C99",
      description: "One of the oldest and most popular openings, named after a Spanish priest from the 16th century. It's characterized by white developing the bishop to pin the knight on c6, creating pressure on black's position.",
      principalLine: [
        { move: "e4", annotation: "White controls the center and opens lines for the bishop and queen." },
        { move: "e5", annotation: "Black mirrors white's move, also competing for the center." },
        { move: "Nf3", annotation: "Developing a knight and attacking black's e5 pawn." },
        { move: "Nc6", annotation: "Developing a knight and defending the e5 pawn." },
        { move: "Bb5", annotation: "The defining move of the Ruy Lopez. White pins the knight on c6." }
      ],
      strength: "Creates immediate pressure and offers white many strategic options.",
      weakness: "Black has many solid defenses that neutralize white's initiative.",
      forPlayerType: "Strategic players who enjoy long-term planning and positional play."
    },
    {
      name: "Sicilian Defense",
      eco: "B20-B99",
      description: "The most popular response to e4, offering black dynamic counterplay. Instead of mirroring white's move, black immediately fights for the center asymmetrically.",
      principalLine: [
        { move: "e4", annotation: "White controls the center and opens lines for the bishop and queen." },
        { move: "c5", annotation: "Black fights for the d4 square without directly blocking the e-pawn." },
        { move: "Nf3", annotation: "Developing a knight and preparing for d4." },
        { move: "d6", annotation: "Black prepares to develop the kingside and control e5." },
        { move: "d4", annotation: "White challenges the center, often leading to a pawn exchange." },
        { move: "cxd4", annotation: "Black captures, changing the pawn structure." },
        { move: "Nxd4", annotation: "White recaptures with the knight." }
      ],
      strength: "Gives black dynamic counterplay and fighting chances for an advantage.",
      weakness: "Creates complex positions that require good theoretical knowledge.",
      forPlayerType: "Tactical players who enjoy complex positions and aren't afraid of theory."
    },
    {
      name: "Queen's Gambit",
      eco: "D06-D69",
      description: "A fundamental opening in chess where white offers a pawn to gain control of the center. Despite the name, it's not truly a gambit as black can't safely keep the pawn.",
      principalLine: [
        { move: "d4", annotation: "White establishes control in the center." },
        { move: "d5", annotation: "Black contests the center." },
        { move: "c4", annotation: "White offers the c-pawn in exchange for greater central control." },
        { move: "e6", annotation: "The most common response, declining the gambit and preparing to develop the bishop." },
        { move: "Nc3", annotation: "White develops a knight and supports the center." },
        { move: "Nf6", annotation: "Black develops a knight and prepares for castling." }
      ],
      strength: "Gives white a solid center and good development prospects.",
      weakness: "Can lead to symmetrical positions that are difficult to win.",
      forPlayerType: "Positional players who prefer solid, reliable positions with small advantages."
    },
    {
      name: "French Defense",
      eco: "C00-C19",
      description: "A solid defense where black establishes a strong pawn chain but temporarily restricts their light-squared bishop. It often leads to closed positions with strategic maneuvering.",
      principalLine: [
        { move: "e4", annotation: "White controls the center and opens lines for the bishop and queen." },
        { move: "e6", annotation: "Black prepares to contest the center with d5, but blocks in the light-squared bishop." },
        { move: "d4", annotation: "White establishes a strong central pawn duo." },
        { move: "d5", annotation: "Black challenges white's center, creating tension." },
        { move: "Nc3", annotation: "White defends the e4 pawn and develops a piece." },
        { move: "Bb4", annotation: "The Winawer variation, where black pins the knight and puts pressure on white's center." }
      ],
      strength: "Creates a solid position for black that's difficult for white to break down.",
      weakness: "The light-squared bishop can become trapped behind the pawn chain.",
      forPlayerType: "Patient defenders who enjoy strategic maneuvering in closed positions."
    },
    {
      name: "King's Indian Defense",
      eco: "E60-E99",
      description: "A hypermodern defense where black allows white to establish a broad center, only to challenge it later with piece play and timely pawn breaks.",
      principalLine: [
        { move: "d4", annotation: "White establishes control in the center." },
        { move: "Nf6", annotation: "Black develops a knight and controls e4." },
        { move: "c4", annotation: "White expands control of the center." },
        { move: "g6", annotation: "Black prepares to fianchetto the bishop to control the long diagonal." },
        { move: "Nc3", annotation: "White develops and supports the center." },
        { move: "Bg7", annotation: "Black fianchettoes the bishop, pressuring white's center from a distance." },
        { move: "e4", annotation: "White establishes a strong pawn center." },
        { move: "d6", annotation: "Black supports the knight and prepares for e5 later." }
      ],
      strength: "Allows black to avoid early theoretical battles and play for a dynamic middlegame.",
      weakness: "White can gain significant space advantage in the center.",
      forPlayerType: "Dynamic players who enjoy counterattacking and are comfortable with temporarily cramped positions."
    }
  ];

  // Custom chess pieces
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
    ),
  };
  
  // Update board when opening or position changes
  useEffect(() => {
    showPosition(currentPositionIndex);
  }, [selectedOpeningIndex, currentPositionIndex]);

  // Show position after specified move
  const showPosition = (moveIndex) => {
    const chess = new Chess();
    const opening = openings[selectedOpeningIndex];
    
    // Play all moves up to the current index
    for (let i = 0; i <= moveIndex && i < opening.principalLine.length; i++) {
      chess.move(opening.principalLine[i].move);
    }
    
    setGame(chess);
  };

  // Go to next move in sequence
  const nextMove = () => {
    if (currentPositionIndex < openings[selectedOpeningIndex].principalLine.length - 1) {
      setCurrentPositionIndex(currentPositionIndex + 1);
    }
  };

  // Update the prevMove function to prevent going below position 0
  const prevMove = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(currentPositionIndex - 1);
    }
  };

  // Choose a different opening
  const selectOpening = (index) => {
    setSelectedOpeningIndex(index);
    setCurrentPositionIndex(0);
  };

  const selectedOpening = openings[selectedOpeningIndex];
  const currentMove = currentPositionIndex >= 0 && currentPositionIndex < selectedOpening.principalLine.length
    ? selectedOpening.principalLine[currentPositionIndex]
    : null;

  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <DashboardNavbar />
      <div className="flex-1 pt-24 px-4 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with back button */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate("/dashboard-pannel")}
                className="text-gray-600 hover:text-black flex items-center gap-1.5 transition-colors mb-2"
              >
                <FiArrowLeft className="text-lg" />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Chess Opening Encyclopedia
              </h1>
              <p className="text-gray-500 mt-1">
                Learn popular chess openings, their principles, and key variations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Openings list */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FiBookOpen className="text-gray-500" />
                    <span>Popular Openings</span>
                  </h2>
                </div>

                <div className="p-4">
                  <div className="space-y-2">
                    {openings.map((opening, index) => (
                      <button
                        key={index}
                        onClick={() => selectOpening(index)}
                        className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                          selectedOpeningIndex === index
                            ? "bg-gray-100 border border-gray-300"
                            : "border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <h3 className={`font-medium ${
                          selectedOpeningIndex === index ? "text-black" : "text-gray-800"
                        }`}>
                          {opening.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">ECO: {opening.eco}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Opening Principles */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <FiInfo className="text-gray-500" />
                    <span>Opening Principles</span>
                  </h2>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-black font-bold">1.</span>
                      <span>Control the center with pawns and pieces</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black font-bold">2.</span>
                      <span>Develop your minor pieces (knights and bishops) early</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black font-bold">3.</span>
                      <span>Castle early to protect your king</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black font-bold">4.</span>
                      <span>Connect your rooks by developing the queen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black font-bold">5.</span>
                      <span>Don't move the same piece multiple times early</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black font-bold">6.</span>
                      <span>Develop with purpose, not just to move pieces</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Middle and right columns - Chessboard and opening details */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chessboard */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {selectedOpening.name}
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Move {currentPositionIndex + 1} of {selectedOpening.principalLine.length}
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="aspect-square">
                      <Chessboard
                        position={game.fen()}
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

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    {/* Navigation buttons with black and white theme */}
                    <div className="flex justify-between">
                      <button
                        onClick={prevMove}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100 text-black transition-colors"
                      >
                        <FiChevronLeft />
                        <span>Previous</span>
                      </button>

                      <button
                        onClick={nextMove}
                        disabled={currentPositionIndex >= selectedOpening.principalLine.length - 1}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                          currentPositionIndex >= selectedOpening.principalLine.length - 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800"
                        }`}
                      >
                        <span>Next</span>
                        <FiChevronRight />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Opening information */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <FiInfo className="text-gray-500" />
                      <span>Opening Analysis</span>
                    </h2>
                  </div>

                  <div className="p-6">
                    <div className="space-y-5">
                      {/* Current move analysis */}
                      {currentMove && (
                        <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                          <h3 className="font-medium text-blue-800">Current Move: {currentMove.move}</h3>
                          <p className="mt-2 text-blue-700">{currentMove.annotation}</p>
                        </div>
                      )}

                      {/* About this opening */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">About this Opening</h3>
                        <p className="text-gray-700">{selectedOpening.description}</p>
                      </div>

                      {/* Strengths and weaknesses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-green-50 border border-green-100 rounded-md p-4">
                          <h4 className="font-medium text-green-800 mb-1">Strengths</h4>
                          <p className="text-green-700 text-sm">{selectedOpening.strength}</p>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-md p-4">
                          <h4 className="font-medium text-red-800 mb-1">Weaknesses</h4>
                          <p className="text-red-700 text-sm">{selectedOpening.weakness}</p>
                        </div>
                      </div>

                      {/* Suitable for */}
                      <div>
                        <h4 className="font-medium text-gray-800 mb-1">Recommended for:</h4>
                        <p className="text-gray-700">{selectedOpening.forPlayerType}</p>
                      </div>

                      {/* Tips */}
                      <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4">
                        <div className="flex items-start gap-2">
                          <FiHelpCircle className="text-yellow-600 mt-1" />
                          <div>
                            <h4 className="font-medium text-yellow-800 mb-1">Study Tip</h4>
                            <p className="text-yellow-700 text-sm">
                              Focus on understanding the ideas behind each move rather than memorizing the sequence.
                              Pay attention to pawn structures and piece development patterns.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Move sequence with improved alignment */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    Principal Variation
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Complete move sequence)
                    </span>
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedOpening.principalLine.map((move, index) => {
                      const moveNumber = Math.floor(index / 2) + 1;
                      const isWhiteMove = index % 2 === 0;
                      
                      return (
                        <React.Fragment key={index}>
                          {isWhiteMove && (
                            <div className="flex items-center">
                              <span className="inline-block w-8 text-right font-medium text-gray-700 mr-1">
                                {moveNumber}.
                              </span>
                            </div>
                          )}
                          <button
                            onClick={() => setCurrentPositionIndex(index)}
                            className={`px-3 py-1.5 rounded-md ${
                              currentPositionIndex === index
                                ? "bg-black text-white font-medium"
                                : "hover:bg-gray-100 border border-gray-200"
                            }`}
                          >
                            {move.move}
                          </button>
                          {/* Add a small spacer after black's move */}
                          {!isWhiteMove && index < selectedOpening.principalLine.length - 1 && (
                            <span className="mr-2"></span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}