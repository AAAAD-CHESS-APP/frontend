import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAward, FiUsers, FiClock, FiRefreshCw } from 'react-icons/fi';
import DashboardNavbar from './DashboardNabvar';
import { gameAPI, puzzleAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function LeaderBoard() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [lichessPlayers, setLichessPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('platform'); // 'platform' or 'lichess'
  const [timeControl, setTimeControl] = useState('blitz');

  // Fetch players from your platform
  const fetchPlatformPlayers = async () => {
    try {
      setIsLoading(true);
      const response = await gameAPI.getTopPlayers();
      
      if (response && response.data) {
        setPlayers(response.data);
      } else {
        toast.error('Failed to load leaderboard data');
      }
    } catch (error) {
      console.error('Error fetching top players:', error);
      toast.error('Could not connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch players from Lichess
  const fetchLichessPlayers = async (mode = 'blitz') => {
    try {
      setIsLoading(true);
      const response = await puzzleAPI.getTop10Players(mode);
      
      if (response && response.data && response.data.users) {
        setLichessPlayers(response.data.users);
      } else {
        toast.error('Failed to load Lichess leaderboard');
      }
    } catch (error) {
      console.error('Error fetching Lichess top players:', error);
      toast.error('Could not connect to Lichess API');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPlatformPlayers();
    fetchLichessPlayers('blitz');
  }, []);

  // Fetch new data when time control changes
  useEffect(() => {
    if (activeTab === 'lichess') {
      fetchLichessPlayers(timeControl);
    }
  }, [timeControl, activeTab]);

  // Handle refresh button click
  const handleRefresh = () => {
    if (activeTab === 'platform') {
      fetchPlatformPlayers();
    } else {
      fetchLichessPlayers(timeControl);
    }
    toast.success('Refreshing leaderboard data...');
  };

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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FiAward className="text-yellow-500" />
                Chess Leaderboard
              </h1>
              <p className="text-gray-500 mt-1">
                See the top-ranked chess players
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <FiRefreshCw className="text-gray-500" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('platform')}
                className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                  activeTab === 'platform'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiUsers />
                  <span>Platform Players</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('lichess')}
                className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                  activeTab === 'lichess'
                    ? 'border-b-2 border-black text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiUsers />
                  <span>Lichess Top Players</span>
                </div>
              </button>
            </div>
          </div>

          {/* Lichess Time Control Filters - Only show when Lichess tab is active */}
          {activeTab === 'lichess' && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {['bullet', 'blitz', 'rapid', 'classical'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTimeControl(mode)}
                    className={`px-4 py-2 rounded-md flex items-center gap-1.5 ${
                      timeControl === mode
                        ? 'bg-black text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FiClock />
                    <span className="capitalize">{mode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* Platform Players Leaderboard */}
          {!isLoading && activeTab === 'platform' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  Top Players on This Platform
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {players.length > 0 ? (
                      players.map((player, index) => (
                        <tr key={player.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`
                                flex items-center justify-center w-8 h-8 rounded-full
                                ${index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                                  index === 1 ? 'bg-gray-100 text-gray-800' : 
                                  index === 2 ? 'bg-orange-100 text-orange-800' : 'text-gray-600'}
                              `}>
                                {player.rank || index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {player.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {player.elo}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                          No players found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Lichess Top Players */}
          {!isLoading && activeTab === 'lichess' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  Top {timeControl.charAt(0).toUpperCase() + timeControl.slice(1)} Players on Lichess
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lichessPlayers.length > 0 ? (
                      lichessPlayers.map((player, index) => (
                        <tr key={player.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`
                                flex items-center justify-center w-8 h-8 rounded-full
                                ${index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                                  index === 1 ? 'bg-gray-100 text-gray-800' : 
                                  index === 2 ? 'bg-orange-100 text-orange-800' : 'text-gray-600'}
                              `}>
                                {index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {player.username}
                              </div>
                              {player.title && (
                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {player.title}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">
                              {player.perfs?.[timeControl]?.rating || player.rating}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                          No players found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Legend / Information Box */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">About the Leaderboard</h3>
            <p className="text-gray-600 mb-4">
              This leaderboard shows the top-ranked players based on their ELO rating. You can view both players from our platform and top players from Lichess.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Platform Ratings</h4>
                <p className="text-gray-600 text-sm">
                  Our platform ratings are calculated based on game outcomes using the ELO rating system, with adjustments made for player experience and activity.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Lichess Time Controls</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li><span className="font-medium">Bullet:</span> Games with less than 3 minutes per player</li>
                  <li><span className="font-medium">Blitz:</span> Games between 3-10 minutes per player</li>
                  <li><span className="font-medium">Rapid:</span> Games between 10-25 minutes per player</li>
                  <li><span className="font-medium">Classical:</span> Games with more than 25 minutes per player</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}