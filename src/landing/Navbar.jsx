import React, { useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../Context/UserContext";
import { IoIosLogIn, IoIosLogOut } from "react-icons/io";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  function logout() {
    localStorage.removeItem("token");
    setUser("");
    navigate("/home");
  }

  function goToDashboard() {
    navigate("/dashboard-pannel");
  }

  return (
    <nav className="bg-transparent fixed top-0 left-0 w-full px-6 py-4 flex items-center justify-between z-50">
      <div className="flex items-center">
        <img src="/LOGO_White.png" alt="" className="h-12 ml-10" />
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-4">
            <button
              onClick={goToDashboard}
              className="bg-white text-black hover:bg-gray-200 transition-all duration-200 px-4 py-2 rounded-md font-medium flex items-center gap-2"
            >
              <MdDashboard className="text-lg" />
              Dashboard
            </button>

            <button
              onClick={logout}
              className="bg-transparent hover:bg-white/10 border border-white text-white transition-all duration-200 px-4 py-2 rounded-md font-medium flex items-center gap-2"
            >
              <IoIosLogOut className="text-lg" />
              Log out
            </button>
          </div>
        )}
        {!user && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="bg-transparent hover:bg-white/10 text-white transition-all duration-200 px-4 py-2 rounded-md font-medium flex items-center gap-2"
            >
              <IoIosLogIn className="text-lg" />
              Log in
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="bg-white text-black hover:bg-gray-200 transition-all duration-200 px-4 py-2 rounded-md font-medium flex items-center gap-2"
            >
              <FiUserPlus className="text-lg" />
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
