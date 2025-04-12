import { useState, useEffect,useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import toast from 'react-hot-toast';
import { io } from "socket.io-client";
import UserContext from "../Context/UserContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ScrollToBottom from 'react-scroll-to-bottom';
import BarLoader from "react-spinners/BarLoader";
import { LuSend } from "react-icons/lu";
import Result from "./Result";

const SOCKET_SERVER_URL = `http://localhost:8080`;
const socket = io(SOCKET_SERVER_URL, {
    autoConnect: false
});

function OnlineGame() {
    const { user, setUser, loading } = useContext(UserContext);
    const [game, setGame] = useState(() => {
        const fen = sessionStorage.getItem('online-game');
        if (fen) return new Chess(fen);
        return new Chess();
    });
    const [color, setColor] = useState('');
    const [RoomName, setRoomName] = useState(() => {
        const room = sessionStorage.getItem('roomName');
        if (room) return room;
        return '';
    });

    const roomNameRef = useRef(RoomName);
    useEffect(() => {
        roomNameRef.current =RoomName;
    }, [RoomName]);

    // const [turn, setTurn] = useState(0);
    const [whitePlayer, setWhitePlayer] = useState('');
    const [blackPlayer, setBlackPlayer] = useState('');
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [movesHistory, setMovesHistory] = useState([]);
    const [quote, setQuote] = useState("");
    const [boardWidth, setBoardWidth] = useState(window.innerWidth * 0.4);
    const [fens, setFens] = useState([]);
    const [showfens, setShowfens] = useState(true);
    const [pgns, setPgns] = useState([]);
    const [showPng, setShowPng] = useState(false);
    const [gameEnded,setGameEnded] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setBoardWidth(window.innerWidth * 0.4);
        };

        window.addEventListener("resize", handleResize);
    }, []);

    useEffect(() => {

        console.log("Socket connected:", socket.connected);
        console.log("RoomName:", RoomName);
        console.log("User:", user);

        if (!user || socket.connected) return;

        socket.io.opts.query = { username: user, connectedToRoom: RoomName };
        socket.connect();

        return () => {
            socket.disconnect();
        };
    }, []);


    useEffect(() => {
        socket.on('room-name', ({ roomName, white, black }) => {
            console.log('Room name received:', roomName);
            sessionStorage.setItem('roomName', roomName);
            console.log('white', white, 'black', black);
            setRoomName(roomName);
            if (white === user) {
                setColor('white');
            } else setColor('black');

            setWhitePlayer(white);
            setBlackPlayer(black);
        });

        socket.on('move-update', ({ fen, pgn }) => {
            setGame(new Chess(fen));
            sessionStorage.setItem('online-game', fen);
            setFens(prevFens => [...prevFens, fen]);
            setPgns(prevPgn => [...prevPgn, pgn]);
        });

        socket.on('game-end', ({ result }) => {
            sessionStorage.removeItem('roomName');
            sessionStorage.removeItem('online-game');
            toast.success(result);
            navigate(`/game/result/${roomNameRef.current}`);
            // navigate('/home');
            setGameEnded(true);
        })
    }, [])


    const notify = (txt) => toast.error(txt);
    

    const onDrop = async (sourceSquare, targetSquare) => {
        try{
        if ((color === 'white' && game.turn() === 'w') || (color === 'black' && game.turn() === 'b')) {

            const move = game.move({
                from: sourceSquare, to: targetSquare,
                promotion: game.get(sourceSquare)?.type === 'p' && (targetSquare[1] === '8' || targetSquare[1] === '1') ? 'q' : undefined
            });

            if (move) {
                socket.emit('move-played', {
                    fen: game.fen(),
                    roomName: RoomName,
                    playedBy: user,
                    color: color,
                    move: game.history(),
                    pgn: game.pgn()
                });

                setGame(new Chess(game.fen()));
                const fen = game.fen();
                sessionStorage.setItem('online-game', fen);
                if (game.isCheckmate()) {
                    const winner = move.color === "w" ? "White" : "Black";
                    await new Promise((resolve) => {
                    socket.emit('game-over', { roomName: RoomName, result: `${winner} wins by checkmate` },resolve);
                });
                    clearSessionStorage();
                    // navigate('/home');
                    navigate(`/game/result/${roomNameRef.current}`);
                    setGameEnded(true);
                } else if (game.isStalemate()) {
                    await new Promise((resolve) => {
                        socket.emit('game-over', { roomName: RoomName, result: `stalemate` },resolve);
                    });
                    clearSessionStorage();
                   // navigate('/home');
                   navigate(`/game/result/${roomNameRef.current}`);
                   setGameEnded(true);

                } else if (game.isDraw()) {
                    await new Promise((resolve) => {
                        socket.emit('game-over', { roomName: RoomName, result: `draw` },resolve);
                    });
                    clearSessionStorage();
                    // navigate('/home');
                    navigate(`/game/result/${roomNameRef.current}`);
                    setGameEnded(true);
                }

                sessionStorage.setItem("game", game.fen());
                setFens(prevFens => [...prevFens, game.fen()]);
                setPgns(prevPgn => [...prevPgn, game.pgn()]);
            }
        }
        else notify("Not Your Turn Nigger");
    }catch(err){
        notify("Invalid Move");
    }
    };



    async function resign() {
        await new Promise((resolve) => {
            socket.emit('resign',  { roomName: RoomName, user: user, color: color },resolve);
        });
        toast.success(`${color} resigned`);
        clearSessionStorage();
        setGameEnded(true);
        navigate(`/game/result/${roomNameRef.current}`);
        //navigate('/home');
    }

    function stopSearchingForThisUser() {
        socket.emit('stop-searching', { userName: user });
    }

    function stopSearchingBtnClicked() {
        stopSearchingForThisUser();
        navigate("/home");
    }


    function sendMessage() {
        socket.emit('send-message', {
            roomName: RoomName, message: message, user: user
        })
        setMessage('');
    }


    useEffect(() => {
        socket.on('new-message', (msg) => {
            setMessages(prevMessages => [...prevMessages, msg]);
        });
    }, [])

    async function getRoomFensAndPng() {
        try {
            const res = await axios.get(`http://localhost:8080/api/currentfensAndpng/${RoomName}`);
            setFens(res.data.fen);
            setPgns(res.data.pgn);
        } catch (err) {
            console.log(err);
        }
    }

    function clearSessionStorage() {
        sessionStorage.removeItem('roomName');
        sessionStorage.removeItem('online-game');
    }
    useEffect(() => {
        getRoomFensAndPng();
        getRoomMessages();
    }, [])

    const fetchQuote = async () => {
        try {
            const response = await axios.get("https://raw.githubusercontent.com/datavizard/chess-quotes-api/master/quotes.json");
            const quotes = response.data;
            const random = quotes[Math.floor(Math.random() * quotes.length)];
            setQuote(`"${random.quote}" - ${random.name}`);
        } catch (e) {
            console.log(e);
        }
    };
    useEffect(() => {
        fetchQuote();
    }, []);

    async function getRoomMessages() {
        if (RoomName && user) {
            try {
                const response = await axios.post(`http://localhost:8080/RoomMessages`, {
                    roomName: RoomName,
                })
                console.log(response.data);
                setMessages(response.data);
            } catch (e) {
                console.log(e)
            }
        }
    }

    const renderFens = fens.map((fen, index) => {
        return <p className="text-gray-600" key={index}>{fen}</p>
    })

    const renderPngs = pgns.map((pgn, index) => {
        return <p className="text-gray-600" key={index}>{pgn}</p>
    })

    const renderMessages = messages.map((msg, index) => {
        return (<div key={index} className=" rounded-sm">
            {/* <p className={` ${msg.user === user ? 'text-green-600' : 'text-orange-500'}`} >{msg.user}</p> */}
            <div className={`flex flex-col ${msg.user == user ? 'items-end' : 'items-start'}`}>
                <div className={`text-white rounded-md p-1 px-2 ${msg.user == user ? 'bg-green-600' : 'bg-[#303030]'} max-w-[70%] break-words`}>{msg.text}</div>
                <div className="text-xs text-gray-600">{msg.timestamp}</div>
            </div>
        </div>)
    })


    function toggleToFen() {
        setShowPng(false);
        setShowfens(true);
    }

    function toggleToPgn() {
        setShowfens(false);
        setShowPng(true);
    }

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

      function cancelSearchAndReturnToDashBoard(){
        stopSearchingForThisUser();
        navigate("/dashboard-pannel")
      }

    return (
        <div>
            {RoomName &&
                <div className="flex items-center justify-around bg-[#121212] h-[100vh]">
                    <div className="bg-[#F3F4F6] w-[28%] flex flex-col p-4 text-white rounded-sm">
                        <p className="text-xl text-black font-semibold border-b-2 pb-2">{user === whitePlayer ? blackPlayer : whitePlayer}</p>
                        <ScrollToBottom className="h-[480px] overflow-x-auto whitespace-normal p-2">
                            <div className="flex gap-4 flex-col">
                                {renderMessages}
                            </div>
                        </ScrollToBottom>
                        <div className="flex items-center justify-center bg-[#ebeaea] p-2 px-3 relative bottom-0 text-black border rounded-sm border-gray-300 ">
                        <input className="outline-none w-[90%] bg-[#ebeaea]"
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            onChange={(e) => setMessage(e.target.value)}
                            value={message}
                            placeholder="Type To Chat"
                        > </input>
                         <LuSend
                        className="ml-2 text-2xl cursor-pointer text-gray-500"
                        onClick={sendMessage}
                        />
                        </div>
                    </div>
                    <div className="flex justify-center flex-col items-center mt-10">
                        <div className="flex flex-row justify-between w-full text-white">
                            <div className={`${
                        (color === 'white' && game.turn() === 'w') || 
                        (color === 'black' && game.turn() === 'b') 
                        ? 'text-white' 
                        : 'text-green-600 font-semibold'
                    }`}>
                        
                        <div className="flex justify-center items-center gap-2 mb-1">
                        <img src={`https://ui-avatars.com/api/?name=${user === whitePlayer ? blackPlayer : whitePlayer}`} className="rounded-full h-[30px]" />
                        {user === whitePlayer ? blackPlayer : whitePlayer}
                        </div>
                    </div>
                            <div>10:00</div>
                        </div>
                        <div>
                            <Chessboard id="defaultBoard"
                                position={game.fen()}
                                onPieceDrop={onDrop}
                                boardOrientation={color === "white" ? "white" : "black"}
                                autoPromoteToQueen={true}
                                boardWidth={boardWidth}
                                customBoardStyle={{
                                    borderRadius: "0.25rem",
                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                  }}
                                  customDarkSquareStyle={{
                                    backgroundColor: "#888c95",
                                  }}
                                  customLightSquareStyle={{
                                    backgroundColor: "#efeceb",
                                  }}
                                  customPieces={customPieces}
                            />
                        </div>
                        <div className="flex flex-row justify-between w-full text-white">
                            <div className={`${
                            (color === 'white' && game.turn() === 'w') || 
                            (color === 'black' && game.turn() === 'b') 
                             ? 'text-green-600  font-semibold' 
                            : 'text-white'
                        }`}>
                            <div className="flex justify-center items-center gap-2 mt-3">
                             <img src={`https://ui-avatars.com/api/?name=${user !== whitePlayer ? blackPlayer : whitePlayer}`} className="rounded-full h-[30px]" />
                            {user} (You)
                            </div>
                            </div>
                            <div>10:00</div>
                        </div>
                        <button className="bg-red-500 text-white px-3 py-1 mt-2 rounded-sm w-20" onClick={resign}>Resign</button>
                    </div>

                    <div className="bg-[#F3F4F6] w-[25%] h-[585px] p-4 text-white relative break-words rounded-sm">
                        <div className="flex flex-row justify-center gap-2">
                            <div className={`${showfens ? `bg-green-600` : `bg-black`}  px-6 py-1 rounded-md cursor-pointer`} onClick={toggleToFen}>fen</div>
                            <div className={`${showPng ? `bg-green-600` : `bg-black`} px-6 py-1 rounded-md cursor-pointer`} onClick={toggleToPgn}>pgn</div>
                        </div>
                        <ScrollToBottom className="h-[540px] whitespace-normal p-2">
                            {showfens && <div className="flex gap-4 flex-col">
                                {renderFens}
                            </div>
                            }
                            {showPng && <div className="flex gap-4 flex-col">
                                {renderPngs}
                            </div>
                            }
                        </ScrollToBottom>
                    </div>

                </div>
            }
            {
                !RoomName &&
                <div className="flex justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100 h-[100vh]">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-8 max-w-2xl w-full mx-4 transform transition duration-500">
                        <div className="text-center mb-8">
                            <div className="inline-block mb-4">
                                <svg className="w-12 h-12 mx-auto text-black animate-pulse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Finding an Opponent</h2>
                            <p className="text-gray-500">We're matching you with a player of similar skill</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 mb-8 border border-gray-100 shadow-inner">
                            <div className="flex items-center">
                                <div className="hidden md:block">
                                    <svg className="w-10 h-10 text-gray-300 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14m-7-7h14"/>
                                    </svg>
                                </div>
                                <blockquote className="text-lg italic text-gray-700 relative">
                                    <span className="absolute -top-4 -left-2 text-4xl text-black opacity-10">"</span>
                                    {quote}
                                    <span className="absolute -bottom-4 -right-2 text-4xl text-black opacity-10">"</span>
                                </blockquote>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex flex-col items-center gap-3 bg-gray-50 py-4 px-8 rounded-lg w-full">
                                <div className="flex items-center justify-center gap-3 text-gray-700 font-medium mb-1">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-black"></span>
                                    </span>
                                    Searching for players
                                </div>
                                <BarLoader
                                    color="#000000"
                                    width={180}
                                    height={4}
                                    speedMultiplier={1.2}
                                    aria-label="Loading Spinner"
                                    data-testid="loader"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                <button 
                                    onClick={stopSearchingBtnClicked} 
                                    className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                    Cancel Search
                                </button>
                                <button 
                                    onClick={cancelSearchAndReturnToDashBoard} 
                                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-50 active:scale-98 transition-all flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                    Return to Dashboard
                                </button>
                            </div>
                        </div>
                        
                        <div className="mt-8 text-center text-sm text-gray-500">
                            <p>Average wait time: ~30 seconds</p>
                        </div>
                    </div>
                </div>
            }


            {/* {gameEnded && 
           <div className="absolute inset-0 w-full backdrop-blur-sm bg-black/30">
           <div className="flex items-center justify-center h-full">
             <div className="bg-white p-6 rounded shadow">
               <Result roomId={RoomName} resetGame={resetGame}/>
             </div>
           </div>
         </div>
            } */}

        </div>
    )
}

export default OnlineGame;