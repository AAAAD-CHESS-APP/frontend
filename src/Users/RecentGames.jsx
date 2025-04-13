import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiDownload, FiFilter } from 'react-icons/fi';
import { MdGames, MdLeaderboard } from 'react-icons/md';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function RecentGames() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState(null);
  
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

        }
         catch (err) {
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
                className={`px-4 py-1.5 rounded-md transition-colors ${
                  filter === 'all' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Games
              </button>
              <button
                onClick={() => setFilter('wins')}
                className={`px-4 py-1.5 rounded-md transition-colors ${
                  filter === 'wins' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Wins
              </button>
              <button
                onClick={() => setFilter('losses')}
                className={`px-4 py-1.5 rounded-md transition-colors ${
                  filter === 'losses' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Losses
              </button>
              <button
                onClick={() => setFilter('draws')}
                className={`px-4 py-1.5 rounded-md transition-colors ${
                  filter === 'draws' 
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
                          onClick={() => navigate(`/game/replay/${game.id}`)}
                          className="text-black font-medium hover:text-gray-700"
                        >
                          View Game
                        </button>
                      </td>
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
