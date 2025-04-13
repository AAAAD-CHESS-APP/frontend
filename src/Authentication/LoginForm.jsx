import React, { useState, useEffect } from "react";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import UserContext from "../Context/UserContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();


  useEffect(()=>{
      if(user) navigate("/");
  },[user]);


  async function login(e) {
    try {
      e.preventDefault();
      const response = await axios.post(`http://localhost:8080/api/login`, {
        email: email,
        password: password
      });
      const data = response.data;
      console.log(data);
      setUser(data.username);
      const token = data.token;
      localStorage.setItem("token", token);
      navigate("/");
    } catch (error) {
      const res = error.response;
      if (res && res.status === 401 && res.data.redirect) {
        window.location.href = res.data.redirect;
        return;
      }
      toast.error(error?.response?.data?.error || "Some error Occurred");
      console.log(error?.response?.data?.error);
    }
  }
  return (
    <>
      <form className="space-y-4">
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="email"
            placeholder="aichess@example.com"
            className="input-style pl-10"
            onInput={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="relative">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="input-style pl-10"
            onInput={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {!showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>

        <div className="w-full flex justify-end text-[#585D69] text-sm">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <button
          type="submit"
          className="bg-[#000814] hover:bg-[#f5f3f3] hover:text-[#000814] text-[#f5f3f3] w-full rounded-lg text-sm font-semibold px-6 py-3 mt-3"
          onClick={(e) => login(e)}
        >
          Log in
        </button>
      </form>
    </>
  );
}
