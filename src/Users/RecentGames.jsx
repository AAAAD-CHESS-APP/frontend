import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiDownload, FiFilter } from 'react-icons/fi';
import { MdGames, MdLeaderboard } from 'react-icons/md';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FiX } from 'react-icons/fi';
import GameViewer from './GameViewer';

export default function RecentGames() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showGameViewer, setShowGameViewer] = useState(false);

  // Add this function to handle opening the modal
  const handleViewGame = (game) => {
    setSelectedGame(game);
    setShowModal(true);
  };



  // Add this function to close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedGame(null);
  };

  const openGameViewer = () => {
    setShowGameViewer(true);
    setShowModal(false); // Close the info modal
  };

  // Add this function to close the game viewer
  const closeGameViewer = () => {
    setShowGameViewer(false);
  };

  useEffect(() => {
    async function fetchGames() {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/userGames', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log(response.data);

        if (response.data && response.data.games) {
          // Format the games data to match UI expectations
          const formattedGames = response.data.games.map(game => {
            const isPlayerBlack = game.black === response.data.playerId;
            const playerColor = isPlayerBlack ? 'Black' : 'White';
            const opponent = isPlayerBlack ? game.whiteName : game.blackName;

            // Determine result
            let result = 'Draw';
            if (game.result.includes('white') && !isPlayerBlack) {
              result = 'Win';
            } else if (game.result.includes('black') && isPlayerBlack) {
              result = 'Win';
            } else {
              result = 'Loss';
            }

            return {
              id: game._id || `game-${Math.random().toString(36).substr(2, 9)}`,
              date: new Date(game.startTime),
              opponent,
              playerColor,
              result,
              moves: game.moves || [],
              gameType: 'Standard',
              pgn: game.fen || [] // We're using FEN instead of PGN
            };
          });

          setGames(formattedGames);

          // If we have player info, set the player name
          if (response.data.playerId) {
            const playerData = await userAPI.getUserById(response.data.playerId, token);
            if (playerData && playerData.data) {
              setPlayerName(playerData.data.name || 'Player');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching game history:', err);
        setError('Error loading games. Please try again later.');
        toast.error('Failed to load game history');
      } finally {
        setIsLoading(false);
      }
    }

    fetchGames();
  }, [playerId]);

  // Filter games based on selected filter
  const filteredGames = games.filter(game => {
    if (filter === 'all') return true;
    if (filter === 'wins') return game.result === 'Win';
    if (filter === 'losses') return game.result === 'Loss';
    if (filter === 'draws') return game.result === 'Draw';
    return true;
  });

  // Helper function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get style class based on result
  const getResultClass = (result) => {
    switch (result) {
      case 'Win':
        return 'bg-green-100 text-green-800';
      case 'Loss':
        return 'bg-red-100 text-red-800';
      case 'Draw':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="w-full bg-white border-b border-gray-200 py-4 px-4 md:px-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard-pannel')}
              className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
            >
              <FiChevronLeft size={18} />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Game History</h1>
          <div className="w-20"></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">{playerName}'s Game History</h2>
              <p className="text-sm text-gray-500 mt-1">Review your recent chess matches</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <p className="text-gray-500 text-sm">Total Games</p>
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-black mt-1">
                    {games.length}
                  </h3>
                  <div className="bg-gray-100 p-2 rounded-full">
                    <MdGames className="text-black text-lg" />
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <p className="text-gray-500 text-sm">Win Rate</p>
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-black mt-1">
                    {games.length > 0
                      ? Math.round((games.filter(g => g.result === 'Win').length / games.length) * 100)
                      : 0}%
                  </h3>
                  <div className="bg-gray-100 p-2 rounded-full">
                    <MdLeaderboard className="text-black text-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-gray-700">
              <FiFilter />
              <span className="font-medium">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-md transition-colors ${filter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All Games
              </button>
              <button
                onClick={() => setFilter('wins')}
                className={`px-4 py-1.5 rounded-md transition-colors ${filter === 'wins'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Wins
              </button>
              <button
                onClick={() => setFilter('losses')}
                className={`px-4 py-1.5 rounded-md transition-colors ${filter === 'losses'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Losses
              </button>
              <button
                onClick={() => setFilter('draws')}
                className={`px-4 py-1.5 rounded-md transition-colors ${filter === 'draws'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Draws
              </button>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/dashboard-pannel')}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Return to Dashboard
            </button>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
            <p className="text-gray-500 mb-2">No games found matching your filter.</p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-black underline"
              >
                Show all games instead
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moves</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGames.map((game) => (
                    <tr key={game.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(game.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold">
                            {game.opponent.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{game.opponent}</p>
                            <p className="text-xs text-gray-500">Playing as {game.playerColor}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getResultClass(game.result)}`}
                        >
                          {game.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* Replaced ELO delta with move count */}
                        {game.moves?.length || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {game.gameType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewGame(game)}
                          className="text-black font-medium hover:text-gray-700"
                        >
                          View Game
                        </button>
                      </td>

                      {showModal && selectedGame && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
                              <h3 className="text-xl font-bold text-gray-900">
                                Game Details
                              </h3>
                              <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <FiX size={24} />
                              </button>
                            </div>

                            <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                  <p className="text-sm text-gray-500">Date</p>
                                  <p className="font-medium">{formatDate(selectedGame.date)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Against</p>
                                  <p className="font-medium">{selectedGame.opponent}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Result</p>
                                  <p className={`font-medium inline-block px-2 py-1 rounded ${selectedGame.result === 'Win' ? 'bg-green-100 text-green-800' :
                                    selectedGame.result === 'Loss' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                    {selectedGame.result}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Playing as</p>
                                  <p className="font-medium">{selectedGame.playerColor}</p>
                                </div>
                              </div>

                              <div className="mb-6">
                                <h4 className="font-bold text-gray-900 mb-3">Move History</h4>
                                {selectedGame.moves && selectedGame.moves.length > 0 ? (
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="h-40 overflow-y-auto pr-2" style={{ maxHeight: '10rem' }}>
                                      <div className="grid grid-cols-2 gap-2">
                                        {selectedGame.moves.map((moveData, idx) => (
                                          <div key={idx} className="flex items-center p-2 border-b border-gray-100">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${moveData.color === 'white' ? 'bg-gray-100' : 'bg-gray-700 text-white'
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
                                ) : (
                                  <p className="text-gray-500">No move data available</p>
                                )}
                              </div>

                              {selectedGame.pgn && selectedGame.pgn.length > 0 && (
                                <div>
                                  <h4 className="font-bold text-gray-900 mb-3">Game Positions (FEN)</h4>
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="h-40 overflow-y-auto pr-2" style={{ maxHeight: '10rem' }}>
                                      {selectedGame.pgn.map((fen, idx) => (
                                        <div key={idx} className="mb-2 pb-2 border-b border-gray-100">
                                          <div className="flex items-center mb-1">
                                            <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                              {idx + 1}
                                            </span>
                                            <span className="text-sm font-medium">
                                              {idx === 0 ? 'Initial Position' : `After move ${idx}`}
                                            </span>
                                          </div>
                                          <code className="block font-mono text-xs text-gray-600 whitespace-nowrap overflow-x-auto p-1">
                                            {fen}
                                          </code>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between">
                              <button
                                onClick={openGameViewer}
                                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                              >
                                View Chessboard
                              </button>
                              <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {showGameViewer && selectedGame && (
                        <GameViewer
                          gameData={selectedGame}
                          onClose={closeGameViewer}
                        />
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
