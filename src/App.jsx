import React from "react";
import Full from "./landing/Full";
import { BrowserRouter, Route, Routes } from "react-router";
import Loginpage from "./Login/Loginpage";
import Signup from "./Login/Signup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Full />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
