import React, { useState } from "react";
import Squares from "../Authentication/Background";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function UserUpdatePassword() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        password
      )
    ) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:8080/api/user/password/${id}`,
        {
          password,
          confirmPass: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(true);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Password update failed. Make sure your password meets the requirements."
        );
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#fff"
          hoverFillColor="#222"
        />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-lg shadow-xl border border-gray-700/50">
        {success ? (
          <>
            <h1 className="text-2xl font-semibold text-[#000814] text-center">
              Password Reset Successful
            </h1>
            <p className="my-4 text-sm text-[#4a4a4a] text-center">
              You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate("/dashboard-pannel")}
              className="w-full bg-[#000814] hover:bg-[#1a1a1a] text-white py-3 px-4 rounded-lg text-sm font-semibold mt-4"
            >
              Back to dashboard
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-[#000814] text-center">
              Choose New Password
            </h1>
            <p className="my-4 text-sm text-[#838894] text-center">
              Almost done. Enter your new password and you're all set.
            </p>
            {error && (
              <p className="text-red-500 text-sm mb-3 font-semibold text-center">
                {error}
              </p>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-style pl-10"
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

              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-style pl-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {!showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>

              <button
                type="submit"
                className="bg-[#000814] hover:bg-[#f5f3f3] hover:text-[#000814] text-white w-full rounded-lg text-sm font-semibold px-6 py-3 mt-3"
              >
                Reset Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
