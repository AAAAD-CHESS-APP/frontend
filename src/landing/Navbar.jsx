import React, { useState } from "react";
import { CgProfile } from "react-icons/cg";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";

export default function Navbar(props) {
  const logged = props.logged;
  const setLogged = props.setLogged;
  // const navigate = useNavigate();

  return (
    <nav className="bg-transparent bg-opacity-50 backdrop-blur-md fixed top-0 left-0 w-full px-6 py-4 flex items-center justify-between z-50">
      <div className="flex items-center">
        <img src="/LOGO_White.png" alt="" className="h-12 ml-10 " />
      </div>
      <div>
        {logged ? (
          <div className="flex items-center gap-4">
            <CgProfile className="w-8 h-8 text-[#d9d9d9]" />
            <button
              onClick={() => setLogged(false)}
              className="px-4 py-2 text-[#d9d9d9] bg-[rgba(26,26,26,0.5)] hover:text-[#d9d9d9] hover:bg-[#6953d6c4] rounded-md font-medium flex items-center gap-2 border border-[#d9d9d9a6]"
            >
              <FiLogIn />
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLogged(true)}
              className="px-4 py-2 text-[#d9d9d9] bg-[rgba(26,26,26,0.5)] hover:text-[#d9d9d9] hover:bg-[#6953d6c4] rounded-md font-medium flex items-center gap-2"
            >
              <FiLogIn />
              Log in
            </button>
            <button className="px-4 py-2 text-[#d9d9d9] bg-[rgba(26,26,26,0.5)] hover:text-[#d9d9d9] hover:bg-[#6953d6c4] rounded-md font-medium flex items-center gap-2 border border-[#d9d9d9a6]">
              <FiUserPlus />
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
