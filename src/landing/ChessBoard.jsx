import React, { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import axios from "axios";

export default function ChessBoard() {
  const [games, setGames] = useState([]);
  const [fen, setFen] = useState("start");
//   const [currentGameIndex, setCurrentGameIndex] = useState(0);
//   const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  useEffect(() => {
    const getGame = async () => {
      try {
        const response = await axios.get("/data.json");
        console.log("Game Data:", response.data);

        if (response.data.data && response.data.data.length > 0) {
          setGames(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    getGame();
  }, []);
  useEffect(() => {
    if (games.length === 0) return; 

    let gameIndex = 0;
    let moveIndex = 0;

    const interval = setInterval(() => {
      const game = games[gameIndex];

      if (!game || !game.data.moves || moveIndex >= game.data.moves.length) {
        gameIndex++;
        moveIndex = 0;
      }

      if (gameIndex >= games.length) {
        clearInterval(interval);
        return;
      }
      setFen(game.data.moves[moveIndex].fen);
    //   setCurrentGameIndex(gameIndex);
    //   setCurrentMoveIndex(moveIndex);

      moveIndex++;
    }, 2000);

    return () => clearInterval(interval);
  }, [games]);

  return (
    <div>
      {/* <h2>Game {currentGameIndex + 1}, Move {currentMoveIndex + 1}</h2> */}
      <Chessboard
        position={fen}
        boardWidth={650}
        customDarkSquareStyle={{ backgroundColor: "#868f96" }}
        customLightSquareStyle={{ backgroundColor: "#e8ecef" }}
      />
    </div>
  );
}
