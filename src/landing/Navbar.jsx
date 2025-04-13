import React, { useState } from "react";
import { MdDashboard } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../Context/UserContext";

import { RxLinkBreak2 } from "react-icons/rx";

import { RiCharacterRecognitionLine } from "react-icons/ri";
import { RiVoiceRecognitionLine } from "react-icons/ri";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  function logout() {
    localStorage.removeItem("token");
    setUser("");
    navigate("/");
  }

  function goToDashboard() {
    navigate("/dashboard-pannel");
  }

  return (
    <nav className="bg-transparent fixed top-0 left-0 w-full px-6 py-4 mt-4 mr-10 flex items-center justify-between z-50">
      <div className="flex items-center">
        <img src="/LOGO_White.png" alt="" className="h-20 ml-24" />
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-6">
            <button
              onClick={goToDashboard}
              className="bg-white border border-black text-black text-2xl hover:bg-transparent hover:border hover:border-white hover:text-[#fff] transition-all duration-400 px-6 py-3 rounded-md font-medium flex items-center gap-2"
            >
              <MdDashboard className="text-3xl" />
              Dashboard
            </button>

            <button
              onClick={logout}
              className="bg-transparent hover:bg-white text-2xl hover:text-black border border-white text-white transition-all duration-400 px-6 py-3 rounded-md font-medium flex items-center gap-2"
            >
              <RxLinkBreak2 className="text-3xl" />
              Log out
            </button>
          </div>
        )}
        {!user && (
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/login")}
              className="bg-transparent hover:bg-white text-2xl border border-white hover:text-black text-white transition-all duration-400 px-6 py-3 rounded-md font-medium flex items-center gap-2"
            >
              <RiCharacterRecognitionLine className="text-3xl" />
              Log in
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="bg-white border border-black text-2xl text-black hover:bg-transparent hover:border hover:border-white hover:text-[#fff] transition-all duration-400 px-6 py-3 rounded-md font-medium flex items-center gap-2"
            >
              <RiVoiceRecognitionLine className="text-3xl" />
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
