import React, { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import axios from "axios";

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

export default function ChessBoard() {
  const [games, setGames] = useState([]);
  const [fen, setFen] = useState("start");
  useEffect(() => {
    const getGame = async () => {
      try {
        const response = await axios.get("/data.json");
        // console.log("Game Data:", response.data);

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

      moveIndex++;
    }, 2000);

    return () => clearInterval(interval);
  }, [games]);

  return (
    <div>
      <Chessboard
        position={fen}
        boardWidth={750}
        customDarkSquareStyle={{
          backgroundColor: "#888c94",
        }}
        customLightSquareStyle={{
          backgroundColor: "#f0ecec",
        }}
        customBoardStyle={{
          borderRadius: "0.25rem",
        }}
        customPieces={customPieces}
        arePiecesDraggable={false}
      />
    </div>
  );
}
