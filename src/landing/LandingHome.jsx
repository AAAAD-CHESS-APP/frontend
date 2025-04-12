import React, { useState } from "react";
import { FaUsers} from "react-icons/fa";
import { FiLogIn, FiUserPlus, FiX } from "react-icons/fi";
import ChessBoard from "./ChessBoard";
import { useNavigate } from "react-router-dom";

import { GoHubot } from "react-icons/go";
import { RiBaseStationLine } from "react-icons/ri";

export default function LandingHome() {
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const playbutton = [
    { id: 1, text: "play with bot", icon: <GoHubot className="text-4xl" /> },
    { id: 2, text: "play Local", icon: <FaUsers className="text-4xl" /> },
    { id: 3, text: "play online", icon: <RiBaseStationLine className="text-4xl" /> },
  ];

  const handleButtonClick = (id) => {
    if (id === 2) {
      navigate("/localgamePage");
    } else {
      if (!token) {
        setShowModal(true);
      } else {
        if (id === 1) navigate("/chess");
        else navigate("/game");
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex flex-row items-center justify-center h-screen w-full text-white relative">
      <div className="relative w-1/2 flex items-center justify-center">
        <div className="w-[90%] pt-[15%] p-[8%] rounded-sm">
          <ChessBoard />
        </div>
      </div>
      <div className="relative w-1/2 flex flex-col items-center justify-evenly">
        {playbutton.map((button) => {
          return (
            <button
              onClick={() => handleButtonClick(button.id)}
              key={button.id}
              className="capitalize text-3xl text-[#d9d9d9] bg-[rgba(26,26,26,0.5)] rounded-md 
              text-center m-4 p-7 w-[330px] flex items-center gap-4 shadow-md hover:text-[#010101] hover:bg-[#fff] transition duration-500 ease-in-out"
            >
              {button.icon}
              {button.text}
            </button>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-[rgba(26,26,26,0.9)] text-white rounded-sm shadow-lg w-[40%] max-w-[500px] h-[40%] max-h-[400px] p-8 flex flex-col items-center justify-between relative animate-fade-in">
            <button 
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <FiX className="text-2xl" />
            </button>
            
            <h2 className="text-4xl font-bold mb-4">Login Required</h2>
            <p className="text-center text-lg text-[#d9d9d9] mb-6">
              You need to log in to continue. Please log in or sign up to
              proceed.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 text-[#d9d9d9] bg-[#010101] hover:bg-[#101010] rounded-lg font-medium flex items-center gap-2 transition duration-300 ease-in-out"
              >
                <FiLogIn className="text-xl" />
                Log in
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-3 text-[#010101] bg-[#fff] hover:bg-[#909090] border border-[#d9d9d9a6] rounded-lg font-medium flex items-center gap-2 transition duration-300 ease-in-out"
              >
                <FiUserPlus className="text-xl" />
                Sign up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
