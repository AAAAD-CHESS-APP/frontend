import React, { useState } from "react";
import Navbar from "./Navbar";
import LandingHome from "./LandingHome";

export default function Full() {
  const [logged, setLogged] = useState(false);
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <video
        src="/back.mp4"
        className="absolute top-0 left-0 w-full h-full object-cover z-10"
        autoPlay
        loop
        muted
      />
      <Navbar logged={logged} setLogged={setLogged} />
      <div className="relative z-20">
        <LandingHome logged={logged} setLogged={setLogged} />
      </div>
    </div>
  );
}
