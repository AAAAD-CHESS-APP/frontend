import React, { useState, useRef, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUser,
  FiLogOut,
  FiMenu,
  FiChevronDown,
  FiSettings,
  FiX,
} from "react-icons/fi";
import { MdLeaderboard, MdSportsCricket } from "react-icons/md";
import {
  GiChessKnight,
  GiChessRook,
  GiChessQueen,
  GiChessKing,
} from "react-icons/gi";
import { IoGameController } from "react-icons/io5";
import toast from "react-hot-toast";
import UserContext from "../Context/UserContext";

const DashboardNabvar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const miniGameDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser("");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-gray-100 text-black"
      : "text-gray-700 hover:bg-gray-100 hover:text-black";
  };

  return (
    <nav className="bg-white text-gray-800 py-3 px-4 md:px-8 fixed top-0 left-0 w-full z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-800 hover:text-black transition-colors"
          >
            <GiChessKing className="text-2xl" />
            <span className="font-medium hidden md:inline">Home</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/game"
            className={`px-3 py-2 rounded-md transition-colors ${isActive(
              "/game"
            )}`}
          >
            <div className="flex items-center gap-2">
              <GiChessRook className="text-lg" />
              <span>Play Online</span>
            </div>
          </Link>

          <Link
            to="/localgamePage"
            className={`px-3 py-2 rounded-md transition-colors ${isActive(
              "/localgamePage"
            )}`}
          >
            <div className="flex items-center gap-2">
              <FiUser className="text-lg" />
              <span>Play Local</span>
            </div>
          </Link>

          <Link
            to="/chess"
            className={`px-3 py-2 rounded-md transition-colors ${isActive(
              "/chess"
            )}`}
          >
            <div className="flex items-center gap-2">
              <IoGameController className="text-lg" />
              <span>Play Engine</span>
            </div>
          </Link>
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
              <GiChessKnight className="text-lg" />
              <span className="font-medium">Puzzles</span>
              <FiChevronDown className="text-sm" />
            </button>
            <div className="absolute h-2 w-full left-0 top-full"></div>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block group-hover:animate-fadeIn">
              <Link
                to="/daily-puzzle"
                className="block px-4 py-2 hover:bg-gray-100 transition-colors text-gray-700"
              >
                <div className="flex items-center gap-2">
                  <GiChessQueen className="text-lg" />
                  <span>Daily Puzzle</span>
                </div>
              </Link>

              <Link
                to="/openings"
                className="block px-4 py-2 hover:bg-gray-100 transition-colors text-gray-700"
              >
                <div className="flex items-center gap-2">
                  <MdSportsCricket className="text-lg" />
                  <span>Openings</span>
                </div>
              </Link>

              <Link
                to="/leaderboard"
                className="block px-4 py-2 hover:bg-gray-100 transition-colors text-gray-700"
              >
                <div className="flex items-center gap-2">
                  <MdLeaderboard className="text-lg" />
                  <span>Leaderboard</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md">
              <div className="h-7 w-7 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="font-medium text-xs text-gray-800">
                  {user ? user.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <span className="font-medium text-sm text-gray-800">
                {user ? user : "User"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="ml-4 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Logout"
            >
              <FiLogOut className="text-xl" />
            </button>
          </div>
          <button
            className="md:hidden text-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FiX className="text-2xl" />
            ) : (
              <FiMenu className="text-2xl" />
            )}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-white mt-3 py-3 rounded-md shadow-lg">
          <Link
            to="/game"
            className="block px-4 py-2 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-2 text-gray-800">
              <GiChessRook className="text-lg" />
              <span>Play Online</span>
            </div>
          </Link>

          <Link
            to="/localgamePage"
            className="block px-4 py-2 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-2 text-gray-800">
              <FiUser className="text-lg" />
              <span>Play Local</span>
            </div>
          </Link>

          <Link
            to="/chess"
            className="block px-4 py-2 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-2 text-gray-800">
              <IoGameController className="text-lg" />
              <span>Play Engine</span>
            </div>
          </Link>

          <div className="border-t border-gray-200 my-2"></div>

          <Link
            to="/daily-puzzle"
            className="block px-4 py-2 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-2 text-gray-800">
              <GiChessQueen className="text-lg" />
              <span>Daily Puzzle</span>
            </div>
          </Link>

          <Link
            to="/openings"
            className="block px-4 py-2 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-2 text-gray-800">
              <MdSportsCricket className="text-lg" />
              <span>Openings</span>
            </div>
          </Link>

          <Link
            to="/leaderboard"
            className="block px-4 py-2 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-2 text-gray-800">
              <MdLeaderboard className="text-lg" />
              <span>Leaderboard</span>
            </div>
          </Link>

          <div className="border-t border-gray-200 my-2"></div>

          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-800">
              <div className="h-7 w-7 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="font-medium text-xs">
                  {user ? user.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <span className="font-medium text-sm">
                {user ? user : "User"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/dashboard-pannel/update-password/${user?.id}`}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiSettings className="text-xl" />
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Logout"
              >
                <FiLogOut className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DashboardNabvar;
