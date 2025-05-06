import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FiSettings, FiUser, FiTrash2, FiEdit, FiLogOut } from "react-icons/fi";
import { MdGames, MdLeaderboard, MdOutlineEmojiEvents } from "react-icons/md";
import UserContext from "../Context/UserContext";
import toast from "react-hot-toast";
import { authAPI, userAPI } from "../services/api";
import DashboardNavbar from "./DashboardNabvar"; // Import the navbar

export default function Userdashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const { playerId } = useParams();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authAPI.verifyToken(token);
        if (
          !response.data ||
          (!response.data.user && !response.data.username)
        ) {
          console.error("No user data in response:", response);
          throw new Error("No user data returned from API");
        }
        const username = response.data.user || response.data.username;
        const userDetailsResponse = await userAPI.getUserByUsername(username);
        if (!userDetailsResponse.data || !userDetailsResponse.data.userId) {
          console.error("Could not get user details:", userDetailsResponse);
          throw new Error("Failed to get user details");
        }
        const userId = userDetailsResponse.data.userId;
        let userEmail = "No email available";
        let joinDate = Date.now();

        try {
          const fullUserDetails = await userAPI.getUserById(userId, token);
          if (fullUserDetails && fullUserDetails.data) {
            userEmail = fullUserDetails.data.email || userEmail;
            joinDate =
              fullUserDetails.data.JoinedDate ||
              fullUserDetails.data.createdAt ||
              joinDate;
          }
        } catch (userDetailError) {
          console.warn(
            "Could not fetch complete user details:",
            userDetailError
          );
        }
        let statsData = {
          wins: 0,
          loses: 0,
          draws: 0,
          elo: 800,
          gamesPlayed: [],
        };
        try {
          const statsResponse = await userAPI.getUserStats(userId);
          if (statsResponse && statsResponse.data) {
            statsData = statsResponse.data;
          }
        } catch (statsError) {
          console.warn("Could not load user stats:", statsError);
        }

        setUserData({
          id: userId,
          username: username,
          email: userEmail,
          elo: statsData.elo || 800,
          wins: statsData.wins || 0,
          loses: statsData.loses || 0,
          draws: statsData.draws || 0,
          gamesPlayed: statsData.gamesPlayed?.length || 0,
          joinDate: new Date(joinDate).toLocaleDateString(),
        });

        setNewUsername(username);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load your profile data");
        if (
          (error.response && error.response.status === 401) ||
          (error.message &&
            (error.message.includes("Invalid token") ||
              error.message.includes("jwt") ||
              error.message.includes("Unauthorized")))
        ) {
          localStorage.removeItem("token");
          toast.error("Your session has expired. Please log in again.");
          setTimeout(() => navigate("/login"), 1500);
        } else {
          toast.error("Error loading dashboard data. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [navigate, setUser]);


  const handleUpdateUsername = async (e) => {
    e.preventDefault();

    if (!newUsername.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await userAPI.updateUser(userData.id, { name: newUsername }, token);

      toast.success("Username updated successfully");
      setUser(newUsername);
      setUserData({ ...userData, username: newUsername });
      setShowUpdateForm(false);
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error(error.response?.data?.message || "Failed to update username");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      await userAPI.deleteUser(userData.id, token);

      toast.success("Account deleted successfully");
      localStorage.removeItem("token");
      setUser("");
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  };

  const getPieChartData = () => {
    const hasGames =
      userData.wins > 0 || userData.loses > 0 || userData.draws > 0;
    if (!hasGames) return [];
    const data = [];

    if (userData.wins > 0) {
      data.push({ name: "Wins", value: userData.wins, color: "#10B981" });
    }

    if (userData.loses > 0) {
      data.push({ name: "Losses", value: userData.loses, color: "#EF4444" });
    }

    if (userData.draws > 0) {
      data.push({ name: "Draws", value: userData.draws, color: "#6B7280" });
    }

    return data;
  };

  const pieData = userData ? getPieChartData() : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white text-black gap-4">
        <div className="text-xl font-semibold">Unable to load dashboard</div>
        <div className="text-gray-500">{error || "No user data available"}</div>
        <button
          onClick={() => navigate("/login")}
          className="bg-black text-white px-5 py-2 rounded-md font-medium hover:bg-gray-800 transition-all mt-4"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white flex h-screen overflow-hidden">
      <DashboardNavbar/>
      <div className="flex-1 overflow-auto bg-gray-50 pt-16">
        <div className="mx-auto w-11/12 max-w-7xl py-6 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                View your chess statistics and manage your account
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">ELO Rating</p>
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-black mt-1">
                  {userData.elo}
                </h3>
                <div className="bg-gray-100 p-2 rounded-full">
                  <MdLeaderboard className="text-black text-lg" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Total Games</p>
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-black mt-1">
                  {userData.gamesPlayed}
                </h3>
                <div className="bg-gray-100 p-2 rounded-full">
                  <MdGames className="text-black text-lg" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Win Rate</p>
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-black mt-1">
                  {userData.gamesPlayed
                    ? Math.round((userData.wins / userData.gamesPlayed) * 100)
                    : 0}
                  %
                </h3>
                <div className="bg-gray-100 p-2 rounded-full">
                  <MdOutlineEmojiEvents className="text-black text-lg" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Member Since</p>
              <div className="flex justify-between items-center">
                <h3 className="text-md font-bold text-black mt-1">
                  {userData.joinDate}
                </h3>
                <div className="bg-gray-100 p-2 rounded-full">
                  <FiUser className="text-black text-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Game Statistics
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-4xl font-bold text-[#10B981]">
                    {userData.wins}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Wins</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-4xl font-bold text-[#EF4444]">
                    {userData.loses}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Losses</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-4xl font-bold text-[#6B7280]">
                    {userData.draws}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Draws</p>
                </div>
              </div>

              <div className="h-52 w-full">
                {pieData && pieData.length > 0 ? (
                  <div className="relative h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={5}
                          dataKey="value"
                          labelLine={false}
                          label={({ name, value }) =>
                            `${name}: ${Math.round(value)}`
                          } // Round to fix decimals
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke={entry.color}
                              strokeWidth={1}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => value} />
                      </PieChart>
                    </ResponsiveContainer>

                    {userData &&
                      userData.wins === 0 &&
                      userData.loses === 0 &&
                      userData.draws === 0 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-sm text-gray-500">
                          No game history yet
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400">
                      Play some games to see your statistics
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Account Settings
                </h2>
                <FiSettings className="text-gray-400" />
              </div>

              {showUpdateForm ? (
                <form onSubmit={handleUpdateUsername} className="mb-6">
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      New Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUpdateForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : showDeleteConfirm ? (
                <div className="mb-6">
                  <p className="text-red-600 mb-4">
                    This action cannot be undone. Please enter your password to
                    confirm.
                  </p>
                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Delete Account
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowUpdateForm(true)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-all"
                  >
                    <div className="flex items-center">
                      <FiEdit className="mr-3 text-gray-500" />
                      <span className="text-gray-800">Update Username</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        "/dashboard-pannel/update-password/" + userData.id
                      )
                    }
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-all"
                  >
                    <div className="flex items-center">
                      <FiSettings className="mr-3 text-gray-500" />
                      <span className="text-gray-800">Change Password</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                  <button
                    onClick={() => navigate("/game/recentGames/" + userData.id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-all"
                  >
                    <div className="flex items-center">
                      <MdGames className="mr-3 text-gray-500" />
                      <span className="text-gray-800">Recent Games</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-all"
                  >
                    <div className="flex items-center">
                      <FiTrash2 className="mr-3 text-red-500" />
                      <span className="text-red-600">Delete Account</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                </div>
              )}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Need help? Contact{" "}
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=aichess.dev@gmail.com&su=Support%20Request&body=Hi%20Support%2C%0A%0AI%20am%20facing%20an%20issue%20with%20..."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="underline text-black">
                      aichess.dev@gmail.com
                    </button>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}