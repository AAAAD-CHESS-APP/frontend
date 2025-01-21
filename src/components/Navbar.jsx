import React, { useState } from "react";
import { CgProfile } from "react-icons/cg";

export default function Navbar() {
  const [logged, setLogged] = useState(false);

  return (
    <nav className="bg-[#d9d9d9] text-white px-4 py-3 flex justify-between items-center shadow-lg absolute top-0 left-0 right-0">
      <div className="flex items-center space-x-3">
        <img
          src="https://play-lh.googleusercontent.com/a7R5nyeaX8lIEWdBOxjlvbyq9LcFwh3XMvNtBPEKR3LPGgdvgGrec4sJwn8tUaaSkw"
          alt="Chess Logo"
          className="w-10 h-10"
        />
        <span className="text-2xl font-bold">Chess<span className="text-xl font-semibold">.com</span></span>
      </div>
      <div>
        {logged ? (
          <div className="flex items-center space-x-4">
            <CgProfile className="w-8 h-8 rounded-full" />
            <button
              onClick={() => setLogged(false)}
              className="px-4 py-2 bg-[#333333] hover:bg-[#333333a1] rounded text-white font-medium"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={() => setLogged(true)}
              className="px-4 bg-[#333333] hover:bg-[#333333a1] py-2 rounded text-white font-medium"
            >
              Log in
            </button>
            <button className="px-4 bg-[#81bc46] hover:bg-[#b2e068] py-2 rounded text-white font-medium">Sign up</button>
          </div>
        )}
      </div>
    </nav>
  );
}
