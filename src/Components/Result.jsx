import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdOutlineEmojiEvents, MdGames } from "react-icons/md";
import { FiHome } from "react-icons/fi";

function Result({ roomId }) {
  const [roomData, setRoomData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  async function getRoomResultData() {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:8080/api/game/${roomId}`);
      setRoomData(response.data);
      console.log(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getRoomResultData();
  }, []);

  // Helper function to determine result badge color
  const getResultBadgeClass = (result) => {
    if (!result) return "bg-gray-100 text-gray-800";
    if (result.includes("White wins")) return "bg-green-100 text-green-800";
    if (result.includes("Black wins")) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800"; // Draw or other results
  };

  // Helper function to format ELO change
  const formatEloChange = (updated, previous) => {
    const change = updated - previous;
    if (change > 0) {
      return <span className="text-green-600 font-medium">(+{change})</span>;
    } else if (change < 0) {
      return <span className="text-red-600 font-medium">({change})</span>;
    }
    return <span className="text-gray-500">(0)</span>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white px-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getResultBadgeClass(roomData.result)}`}>
              {roomData.result || "Game Complete"}
            </span>
          </div>
          
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6">Match Results</h2>
          
          <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
            {/* White Player */}
            <div className="bg-white w-1/2 p-4 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <span className="text-xl font-bold">{roomData.whiteName?.charAt(0).toUpperCase() || "W"}</span>
              </div>
              <h3 className="font-medium text-black mb-1">{roomData.whiteName}</h3>
              <div className="flex items-center">
                <span className="font-bold">{roomData.UpdatedWhiteElo || "-"}</span>
                <span className="ml-1">
                  {roomData.prevWhiteElo ? 
                    formatEloChange(roomData.UpdatedWhiteElo, roomData.prevWhiteElo) : 
                    ""}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">White</div>
            </div>
            
            {/* Black Player */}
            <div className="bg-gray-900 w-1/2 p-4 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-black">{roomData.blackName?.charAt(0).toUpperCase() || "B"}</span>
              </div>
              <h3 className="font-medium text-white mb-1">{roomData.blackName}</h3>
              <div className="flex items-center text-white">
                <span className="font-bold">{roomData.UpdatedBlackElo || "-"}</span>
                <span className="ml-1">
                  {roomData.prevBlackElo ? 
                    roomData.UpdatedBlackElo - roomData.prevBlackElo >= 0 ? 
                      <span className="text-green-400 font-medium">(+{roomData.UpdatedBlackElo - roomData.prevBlackElo})</span> : 
                      <span className="text-red-400 font-medium">({roomData.UpdatedBlackElo - roomData.prevBlackElo})</span> 
                    : ""}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-300">Black</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/home')} 
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-all"
            >
              <FiHome size={16} />
              Dashboard
            </button>
            <button 
              onClick={() => navigate('/game')} 
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-black rounded-md text-white font-medium hover:bg-gray-800 transition-all"
            >
              <MdGames size={16} />
              New Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;