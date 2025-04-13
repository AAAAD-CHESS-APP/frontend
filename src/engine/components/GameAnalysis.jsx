import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CustomChessboard from './ChessBoard';

const GameAnalysis = ({ moveHistory, game, difficulty, playerColor }) => {
    const [analysisInProgress, setAnalysisInProgress] = useState(false);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [tacticalOpportunities, setTacticalOpportunities] = useState([]);
    const [selectedPosition, setSelectedPosition] = useState(0);
    const [displayFen, setDisplayFen] = useState('');
    const [analysisType, setAnalysisType] = useState('overview'); // 'overview', 'position', 'tactics'

    // Extract FENs and moves from the move history
    const extractGameData = () => {
        if (!moveHistory || moveHistory.length === 0) {
            toast.error('No moves to analyze!');
            return null;
        }

        const fens = moveHistory.map(move => move.fen);

        // Extract the actual moves (not the initial position)
        const moves = [];
        for (let i = 1; i < moveHistory.length; i++) {
            const moveText = moveHistory[i].moveText;
            // Extract the move coordinates (e.g., "e2-e4" from "You: e2-e4")
            const moveParts = moveText.split(': ');
            if (moveParts.length > 1) {
                const coords = moveParts[1].split('-');
                if (coords.length === 2) {
                    moves.push({
                        from: coords[0],
                        to: coords[1]
                    });
                }
            }
        }

        return { fens, moves: moves.map(m => `${m.from}${m.to}`) };
    };

    const startAnalysis = async () => {
        const gameData = extractGameData();
        if (!gameData) return;

        setAnalysisInProgress(true);
        setAnalysisType('overview');
        try {
            // Analyze each position in the game
            const positions = [];
            for (let i = 0; i < gameData.fens.length; i++) {
                const fen = gameData.fens[i];
                const response = await fetch(`${import.meta.env.VITE_REACT_APP_ENGINE_API_URL}analyze?fen=${encodeURIComponent(fen)}&depth=${difficulty}`);
                if (!response.ok) {
                    throw new Error('Failed to analyze position');
                }
                const analysis = await response.json();
                positions.push({
                    ...analysis,
                    moveNumber: i,
                    moveText: i === 0 ? "Starting position" : moveHistory[i].moveText
                });
            }

            setAnalysisResults({
                positions,
                overallEvaluation: calculateOverallEvaluation(positions)
            });

            setDisplayFen(gameData.fens[gameData.fens.length - 1]);
            setSelectedPosition(gameData.fens.length - 1);

            toast.success('Analysis completed!');
        } catch (error) {
            console.error('Analysis failed:', error);
            toast.error(`Analysis failed: ${error.message}`);
        } finally {
            setAnalysisInProgress(false);
        }
    };

    const startTacticalAnalysis = async () => {
        const gameData = extractGameData();
        if (!gameData) return;

        setAnalysisInProgress(true);
        setAnalysisType('tactics');
        try {
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_ENGINE_API_URL}find-tactics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fens: gameData.fens,
                    moves: gameData.moves,
                    depth: difficulty
                })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze tactical opportunities');
            }

            const tacticsData = await response.json();
            setTacticalOpportunities(tacticsData.opportunities || []);

            if (tacticsData.opportunities && tacticsData.opportunities.length > 0) {
                // Show the first tactical opportunity
                const firstOpportunity = tacticsData.opportunities[0];
                setDisplayFen(firstOpportunity.fen);
                toast.success(`Found ${tacticsData.opportunities.length} tactical opportunities!`);
            } else {
                setDisplayFen(gameData.fens[gameData.fens.length - 1]);
                toast.info('No significant tactical opportunities found.');
            }
        } catch (error) {
            console.error('Tactical analysis failed:', error);
            toast.error(`Tactical analysis failed: ${error.message}`);
        } finally {
            setAnalysisInProgress(false);
        }
    };

    const analyzeCurrentPosition = async () => {
        if (!game) {
            toast.error('No active game!');
            return;
        }

        setAnalysisInProgress(true);
        setAnalysisType('position');
        try {
            const fen = game.fen();
            const response = await fetch(`${import.meta.env.VITE_REACT_APP_ENGINE_API_URL}analyze?fen=${encodeURIComponent(fen)}&depth=${difficulty}`);

            if (!response.ok) {
                throw new Error('Failed to analyze position');
            }

            const analysis = await response.json();
            setAnalysisResults({
                positions: [{
                    ...analysis,
                    moveNumber: moveHistory.length - 1,
                    moveText: "Current position"
                }],
                overallEvaluation: null
            });

            setDisplayFen(fen);
            toast.success('Position analyzed!');
        } catch (error) {
            console.error('Position analysis failed:', error);
            toast.error(`Position analysis failed: ${error.message}`);
        } finally {
            setAnalysisInProgress(false);
        }
    };

    const calculateOverallEvaluation = (positions) => {
        if (!positions || positions.length === 0) return null;

        // Skip the initial position
        const scores = positions
            .filter(p => p.moveNumber > 0)
            .map(p => p.score || 0);

        if (scores.length === 0) return null;

        const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        const min = Math.min(...scores);
        const max = Math.max(...scores);

        let advantage;
        if (avg > 0.5) {
            advantage = "White has an advantage";
        } else if (avg < -0.5) {
            advantage = "Black has an advantage";
        } else {
            advantage = "Position is approximately equal";
        }

        return {
            averageScore: avg.toFixed(2),
            minScore: min.toFixed(2),
            maxScore: max.toFixed(2),
            advantage
        };
    };

    const handlePositionSelect = (index) => {
        if (analysisResults && analysisResults.positions && index < analysisResults.positions.length) {
            setSelectedPosition(index);
            setDisplayFen(analysisResults.positions[index].fen);
        }
    };

    const handleTacticsSelect = (opportunity) => {
        setDisplayFen(opportunity.fen);
    };

    const getArrows = () => {
        const arrows = [];
    
        if (analysisType === 'position' || analysisType === 'overview') {
            if (analysisResults && analysisResults.positions && analysisResults.positions.length > selectedPosition) {
                const position = analysisResults.positions[selectedPosition];
                if (position.bestMove && position.bestMove !== 'no move') {
                    const from = position.bestMove.substring(0, 2);
                    const to = position.bestMove.substring(2, 4);
                    
                    // Make sure from and to are valid squares (a1-h8)
                    if (/^[a-h][1-8]$/.test(from) && /^[a-h][1-8]$/.test(to)) {
                        arrows.push([from, to, 'green']);
                    }
                }
            }
        } else if (analysisType === 'tactics') {
            // For tactical analysis, show both the actual move and best move
            const opportunity = tacticalOpportunities.find(o => o.fen === displayFen);
            if (opportunity) {
                // Show actual move in red
                if (opportunity.actualMove) {
                    const from = opportunity.actualMove.substring(0, 2);
                    const to = opportunity.actualMove.substring(2, 4);
                    // Make sure from and to are valid squares
                    if (/^[a-h][1-8]$/.test(from) && /^[a-h][1-8]$/.test(to)) {
                        arrows.push([from, to, 'red']);
                    }
                }
    
                // Show best move in green
                if (opportunity.bestMove) {
                    const from = opportunity.bestMove.substring(0, 2);
                    const to = opportunity.bestMove.substring(2, 4);
                    // Make sure from and to are valid squares
                    if (/^[a-h][1-8]$/.test(from) && /^[a-h][1-8]$/.test(to)) {
                        arrows.push([from, to, 'green']);
                    }
                }
            }
        }
    
        return arrows;
    };

    const renderAnalysisResults = () => {
        if (analysisInProgress) {
            return (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-lg">Analyzing...</span>
                </div>
            );
        }

        if (!analysisResults) return null;

        if (analysisType === 'overview') {
            return (
                <div className="mt-[-4rem]">
                    <h3 className="text-lg font-bold mb-3 text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Game Analysis
                    </h3>

                    {analysisResults.overallEvaluation && (
                        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-lg text-white">
                            <div className="text-md font-semibold text-blue-300">Overall Evaluation</div>
                            <div className="flex flex-col mt-2">
                                <div className="flex justify-between items-center py-1">
                                    <span>Average Score:</span>
                                    <span className={`font-mono font-medium ${
                                        parseFloat(analysisResults.overallEvaluation.averageScore) > 0.5 ? 'text-green-400' :
                                        parseFloat(analysisResults.overallEvaluation.averageScore) < -0.5 ? 'text-red-400' :
                                        'text-blue-300'
                                    }`}>
                                        {analysisResults.overallEvaluation.averageScore}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span>Score Range:</span>
                                    <span className="font-mono">
                                        [{analysisResults.overallEvaluation.minScore}, {analysisResults.overallEvaluation.maxScore}]
                                    </span>
                                </div>
                                <div className="mt-2 text-sm bg-gray-700 p-2 rounded">
                                    {analysisResults.overallEvaluation.advantage}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-4">
                        <h4 className="text-md text-white mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Position Timeline
                        </h4>
                        <div className="h-48 overflow-y-auto bg-gray-800 rounded-lg shadow-lg">
                            {analysisResults.positions.map((position, index) => (
                                <div
                                    key={index}
                                    className={`p-3 cursor-pointer transition-all hover:bg-gray-700 border-b border-gray-700 ${
                                        selectedPosition === index ? 'bg-blue-900 border-l-4 border-l-blue-500 ' : ''
                                    }`}
                                    onClick={() => handlePositionSelect(index)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="text-white">
                                            <span className="font-medium mr-2">{position.moveNumber}.</span>
                                            <span>{position.moveText}</span>
                                        </div>
                                        <div className={`font-mono font-medium ${
                                            position.score > 0.5 ? 'text-green-400' :
                                            position.score < -0.5 ? 'text-red-400' :
                                            'text-blue-300'
                                        }`}>
                                            {position.score ? position.score.toFixed(2) : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {analysisResults.positions && analysisResults.positions[selectedPosition] && (
                        <div className="mt-4">
                            <h4 className="text-md text-white mb-2 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Selected Position Analysis
                            </h4>
                            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
                                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                    <span className="font-medium text-white">Position Score:</span>
                                    <span className={`font-mono font-medium ${
                                        analysisResults.positions[selectedPosition].score > 0.5 ? 'text-green-400' :
                                        analysisResults.positions[selectedPosition].score < -0.5 ? 'text-red-400' :
                                        'text-blue-300'
                                    }`}>
                                        {analysisResults.positions[selectedPosition].score ?
                                            analysisResults.positions[selectedPosition].score.toFixed(2) : 'N/A'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                    <span className="font-medium text-white">Best Move:</span>
                                    <span className="font-mono font-medium text-green-400">
                                        {analysisResults.positions[selectedPosition].bestMove !== 'no move' ?
                                            analysisResults.positions[selectedPosition].bestMove : 'N/A'}
                                    </span>
                                </div>

                                {analysisResults.positions[selectedPosition].lines &&
                                    analysisResults.positions[selectedPosition].lines.length > 0 && (
                                        <div className="mt-3">
                                            <div className="font-medium text-white mb-2">Top Variations:</div>
                                            <div className="space-y-2">
                                                {analysisResults.positions[selectedPosition].lines
                                                    .filter(line => line.pv)
                                                    .slice(0, 3)
                                                    .map((line, idx) => (
                                                        <div key={idx} className="p-2 bg-gray-700 rounded text-gray-100 font-mono text-sm">
                                                            {line.pv.slice(0, 5).join(' ')}
                                                            {line.score && (
                                                                <span className={`ml-2 ${
                                                                    line.score > 0 ? 'text-green-400' :
                                                                    line.score < 0 ? 'text-red-400' :
                                                                    'text-gray-300'
                                                                }`}>
                                                                    ({line.score.toFixed(2)})
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}
                </div>
            );
        } else if (analysisType === 'position') {
            return (
                <div className="mt-4">
                    <h3 className="text-lg font-bold mb-3 text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Current Position Analysis
                    </h3>

                    {analysisResults.positions && analysisResults.positions[0] && (
                        <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="font-medium text-white">Position Score:</span>
                                <span className={`font-mono font-medium ${
                                    analysisResults.positions[0].score > 0.5 ? 'text-green-400' :
                                    analysisResults.positions[0].score < -0.5 ? 'text-red-400' :
                                    'text-blue-300'
                                }`}>
                                    {analysisResults.positions[0].score ? analysisResults.positions[0].score.toFixed(2) : 'N/A'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="font-medium text-white">Best Move:</span>
                                <span className="font-mono font-medium text-green-400">
                                    {analysisResults.positions[0].bestMove !== 'no move' ?
                                        analysisResults.positions[0].bestMove : 'N/A'}
                                </span>
                            </div>

                            {analysisResults.positions[0].lines && analysisResults.positions[0].lines.length > 0 && (
                                <div className="mt-4">
                                    <div className="font-medium text-white mb-2">Top Variations:</div>
                                    <div className="space-y-3">
                                        {analysisResults.positions[0].lines
                                            .filter(line => line.pv)
                                            .slice(0, 3)
                                            .map((line, idx) => (
                                                <div key={idx} className="p-3 bg-gray-700 rounded">
                                                    <div className="font-medium text-blue-300 mb-1">Variation {idx + 1}:</div>
                                                    <div className="font-mono text-gray-100">
                                                        {line.pv && line.pv.slice(0, 8).join(' ')}
                                                        {line.score !== undefined &&
                                                            <span className={`ml-2 font-medium ${
                                                                line.score > 0 ? 'text-green-400' :
                                                                line.score < 0 ? 'text-red-400' :
                                                                'text-gray-300'
                                                            }`}>
                                                                ({typeof line.score === 'number' ? line.score.toFixed(2) : line.score})
                                                            </span>
                                                        }
                                                        {line.mate !== undefined &&
                                                            <span className="ml-2 font-bold text-purple-400">
                                                                (Mate in {Math.abs(line.mate)})
                                                            </span>
                                                        }
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return null;
    };

    const renderTacticalOpportunities = () => {
        if (analysisInProgress) {
            return (
                <div className="flex justify-center items-center h-40 bg-gray-800 bg-opacity-50 rounded-lg">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-400"></div>
                    <span className="ml-3 text-lg text-purple-300">Analyzing tactics...</span>
                </div>
            );
        }

        if (!tacticalOpportunities || tacticalOpportunities.length === 0) {
            return (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700 text-center text-gray-300">
                    No significant tactical opportunities found in this game.
                </div>
            );
        }

        return (
            <div className="mt-4">
                <h3 className="text-xl font-bold mb-3 text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Tactical Opportunities
                </h3>
                <div className="h-64 overflow-y-auto bg-gray-800 rounded-lg shadow-lg">
                    {tacticalOpportunities.map((opportunity, index) => (
                        <div
                            key={index}
                            className={`p-3 cursor-pointer transition-all hover:bg-gray-700 border-b border-gray-700 ${
                                displayFen === opportunity.fen ? 'bg-purple-900 border-l-4 border-l-purple-500' : ''
                            }`}
                            onClick={() => handleTacticsSelect(opportunity)}
                        >
                            <div className="flex justify-between items-center">
                                <div className="text-white">
                                    <span className="font-medium">Move {opportunity.moveNumber}: </span>
                                    <span className={`font-medium ${
                                        opportunity.classification === 'Blunder' ? 'text-red-400' :
                                        opportunity.classification === 'Mistake' ? 'text-orange-400' :
                                        opportunity.classification === 'Inaccuracy' ? 'text-yellow-400' :
                                        'text-gray-400'
                                    }`}>
                                        {opportunity.classification}
                                    </span>
                                </div>
                                <div className="text-red-400 font-mono font-medium">
                                    {opportunity.scoreDifference > 0 ? '+' : ''}
                                    {opportunity.scoreDifference.toFixed(2)}
                                </div>
                            </div>
                            <div className="mt-1 text-sm text-gray-300">
                                <span>Played: </span>
                                <span className="font-mono">{opportunity.actualMove}</span>
                                <span className="mx-2">|</span>
                                <span>Best: </span>
                                <span className="font-mono text-green-400">{opportunity.bestMove}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {displayFen && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-lg">
                        <div className="font-medium text-white mb-3">Position Details:</div>
                        {tacticalOpportunities.find(o => o.fen === displayFen) && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                    <span className="text-gray-300">Played Move: </span>
                                    <span className="font-mono text-white">{tacticalOpportunities.find(o => o.fen === displayFen).actualMove}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                    <span className="text-gray-300">Best Move: </span>
                                    <span className="font-mono text-green-400">{tacticalOpportunities.find(o => o.fen === displayFen).bestMove}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                    <span className="text-gray-300">Evaluation Difference: </span>
                                    <span className="text-red-400 font-mono font-medium">
                                        {tacticalOpportunities.find(o => o.fen === displayFen).scoreDifference.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="mt-3 text-sm text-center text-gray-400 bg-gray-700 p-2 rounded">
                            <div className="flex justify-center items-center space-x-4">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                                    <span>Best move</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                                    <span>Played move</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full text-gray-900">
            <div className="flex flex-row gap-4">
                <div className="flex flex-col">
                    <div className="flex mb-4 justify-center gap-2">
                        <button
                            onClick={analyzeCurrentPosition}
                            disabled={analysisInProgress}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center ${
                                analysisInProgress 
                                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                            } shadow-md`}
                        >   
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            Analyze Current Position
                        </button>
                        <button
                            onClick={startAnalysis}
                            disabled={analysisInProgress || !moveHistory || moveHistory.length <= 1}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center ${
                                analysisInProgress || !moveHistory || moveHistory.length <= 1
                                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                            } shadow-md`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Analyze Full Game
                        </button>
                        <button
                            onClick={startTacticalAnalysis}
                            disabled={analysisInProgress || !moveHistory || moveHistory.length <= 2}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center ${
                                analysisInProgress || !moveHistory || moveHistory.length <= 2
                                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                            } shadow-md`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Find Tactical Opportunities
                        </button>
                    </div>

                    <div>
                        {displayFen && (
                            <div>
                                <CustomChessboard
                                    fen={displayFen}
                                    boardOrientation={playerColor === 'w' ? 'white' : 'black'}
                                    arePiecesDraggable={false}
                                    arrows={getArrows()}
                                    customSquareStyles={{}}
                                    width={96}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 order-1 md:order-2">
                    {analysisType === 'tactics' ? renderTacticalOpportunities() : renderAnalysisResults()}
                </div>
            </div>
        </div>
    );
};

export default GameAnalysis;