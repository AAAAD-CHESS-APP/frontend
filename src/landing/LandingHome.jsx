import React, { useState } from "react";
import { FaRobot, FaUsers, FaGlobe } from "react-icons/fa";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
import ChessBoard from "./ChessBoard";

export default function LandingHome(props) {
  const logged = props.logged;
  const setLogged = props.setLogged;
  const [showModal, setShowModal] = useState(false);

  const playbutton = [
    { id: 1, text: "play with bot", icon: <FaRobot className="text-4xl" /> },
    { id: 2, text: "play with friend", icon: <FaUsers className="text-4xl" /> },
    { id: 3, text: "play online", icon: <FaGlobe className="text-4xl" /> },
  ];

  const handleButtonClick = () => {
    if (!logged) {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex flex-row items-center justify-center h-screen w-full text-white relative">
      <div className="relative w-1/2 flex items-center justify-center">
        {/* <img
          src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/CHESScom/phphK5JVu.png"
          alt="Chess board"
          className="w-[90%] pt-[13%] p-[8%]"
        /> */}
        <div className="w-[90%] pt-[15%] p-[8%] opacity-75">
          <ChessBoard />
        </div>
      </div>
      <div className="relative w-1/2 flex flex-col items-center justify-evenly">
        {playbutton.map((button) => {
          return (
            <button
              onClick={handleButtonClick}
              key={button.id}
              className="capitalize text-3xl text-[#d9d9d9] bg-[rgba(26,26,26,0.5)] rounded-md text-center m-4 p-7 w-[330px] flex items-center gap-4 shadow-md hover:text-[#d9d9d9] hover:bg-[#6953d6c4]"
            >
              {button.icon}
              {button.text}
            </button>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-[rgba(26,26,26,0.9)] text-white rounded-2xl shadow-lg w-[40%] max-w-[500px] h-[40%] max-h-[400px] p-8 flex flex-col items-center justify-between relative animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Login Required</h2>
            <p className="text-center text-lg text-[#d9d9d9] mb-6">
              You need to log in to continue. Please log in or sign up to
              proceed.
            </p>
            <div className="flex gap-4">
              <button
                onClick={closeModal}
                className="px-6 py-3 text-[#d9d9d9] bg-[#6953d6] hover:bg-[#5a45c1] rounded-lg font-medium flex items-center gap-2 transition duration-300 ease-in-out"
              >
                <FiLogIn className="text-xl" />
                Log in
              </button>
              <button
                onClick={closeModal}
                className="px-6 py-3 text-[#d9d9d9] bg-[#2b2b2b] hover:bg-[#3d3d3d] border border-[#d9d9d9a6] rounded-lg font-medium flex items-center gap-2 transition duration-300 ease-in-out"
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
