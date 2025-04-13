import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { FiUsers, FiClock, FiPlay, FiRefreshCw } from "react-icons/fi";

function LocalGamePage() {
    const [player1, setPlayer1] = useState("");
    const [player2, setPlayer2] = useState("");
    const [timeControl, setTimeControl] = useState("infinity");
    const [hasPreviousGame, setHasPreviousGame] = useState(false);
    const navigate = useNavigate();
    
    const timeOptions = [
        { value: "1", label: "1 Minute" },
        { value: "5", label: "5 Minutes" },
        { value: "10", label: "10 Minutes" },
        { value: "15", label: "15 Minutes" },
        { value: "infinity", label: "∞" },
    ];

    // Check for previous game on component mount
    useEffect(() => {
        const storedGameId = localStorage.getItem("local-gameId");
        const storedGame = localStorage.getItem("localgame");
        const player1 = localStorage.getItem("player1");
        const player2 = localStorage.getItem("player2");
        
        // Only show continue option if we have all required data
        if (storedGameId && storedGame && player1 && player2) {
            setHasPreviousGame(true);
        }
    }, []);

    // Continue a previous game
    function continuePreviousGame() {
        const gameId = localStorage.getItem("local-gameId");
        const player1 = localStorage.getItem("player1");
        const player2 = localStorage.getItem("player2");
        const timeControl = localStorage.getItem("timeControl") || "infinity";
        
        if (!gameId || !player1 || !player2) {
            toast.error("Previous game data is incomplete");
            clearGameData();
            return;
        }
        
        navigate(`/localgame/${gameId}`, {
            state: {
                player1,
                player2,
                timeControl
            }
        });
    }

    // Clear all game related data from localStorage
    function clearGameData() {
        localStorage.removeItem("localgame");
        localStorage.removeItem("local-gameId");
        localStorage.removeItem("local-fens");
        localStorage.removeItem("local-pgns");
        localStorage.removeItem("localplayer");
        localStorage.removeItem("player1");
        localStorage.removeItem("player2");
        localStorage.removeItem("whiteTime");
        localStorage.removeItem("blackTime");
        localStorage.removeItem("timeControl");
        setHasPreviousGame(false);
    }

    // Start a new local game
    function startLocalGame() {
        if (player1.trim() === '' || player2.trim() === '') {
            toast.error("Please enter names for both players");
            return;
        }
        
        // Clear previous game data and set new values
        clearGameData();
        
        // Generate new game ID and store game settings
        const gameId = uuidv4();
        localStorage.setItem("local-gameId", gameId);
        localStorage.setItem("timeControl", timeControl);
        localStorage.setItem("player1", player1);
        localStorage.setItem("player2", player2);
        
        // Set initial times if using time control
        if (timeControl !== "infinity") {
            const initialSeconds = parseInt(timeControl) * 60;
            localStorage.setItem("whiteTime", initialSeconds.toString());
            localStorage.setItem("blackTime", initialSeconds.toString());
        }
        
        navigate(`/localgame/${gameId}`, {
            state: {
                player1,
                player2,
                timeControl
            }
        });
    }

    return (
        <div 
            className="min-h-screen flex items-center justify-center bg-gray-50 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url("/bg2.jpg")' }}
        >
            <div className="flex flex-col items-center gap-6 p-8 bg-white border border-gray-200 rounded-lg shadow-sm max-w-lg w-full mx-4">
                <h2 className="text-2xl font-bold text-gray-900">Local Chess Game</h2>
                
                <div className="w-full">
                    <p className="text-sm text-gray-500 mb-4">Enter player information to start a new game or continue a previous one</p>
                
                    <div className="flex flex-col gap-4 w-full">
                        {hasPreviousGame && (
                            <button
                                onClick={continuePreviousGame}
                                className="w-full border border-gray-300 text-gray-700 rounded-md py-3 px-4 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                <FiRefreshCw className="text-gray-600" />
                                Continue Previous Game
                            </button>
                        )}

                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <div className="h-5 w-5 rounded-full bg-white border-2 border-gray-300"></div>
                            </div>
                            <input
                                placeholder="Enter White Player name"
                                value={player1}
                                onChange={(e) => setPlayer1(e.target.value)}
                                className="pl-10 w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <div className="h-5 w-5 rounded-full bg-black border-2 border-black"></div>
                            </div>
                            <input
                                placeholder="Enter Black Player name"
                                value={player2}
                                onChange={(e) => setPlayer2(e.target.value)}
                                className="pl-10 w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                            />
                        </div>
                        
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                <FiClock />
                            </div>
                            <select
                                value={timeControl}
                                onChange={(e) => setTimeControl(e.target.value)}
                                className="pl-10 w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: 'right 0.5rem center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: '1.5em 1.5em',
                                    paddingRight: '2.5rem'
                                }}
                            >
                                {timeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={startLocalGame}
                            className="w-full bg-black text-white rounded-md py-3 px-4 font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            <FiPlay />
                            Start New Game
                        </button>
                        
                        <button
                            onClick={() => navigate('/dashboard-pannel')}
                            className="w-full text-gray-500 py-2 hover:underline transition-all text-sm"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
                
                <div className="w-full border-t border-gray-200 pt-4 mt-2">
                    <p className="text-xs text-gray-500 text-center">
                        Play against a friend on the same device
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LocalGamePage;