import { adminAPI, userAPI, gameAPI, puzzleAPI } from "./api";

// ==================== AUTH FUNCTIONS ====================
export const adminLogin = async (email, password) => {
  try {
    const response = await adminAPI.login(email, password);
    if (response.data && response.data.token) {
      localStorage.setItem("adminToken", response.data.token);
      return { success: true, data: response.data };
    }
    return { success: false, message: "Invalid credentials" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

export const adminLogout = () => {
  localStorage.removeItem("adminToken");
  return { success: true, message: "Logged out successfully" };
};

// ==================== DASHBOARD FUNCTIONS ====================
export const getDashboardStats = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, message: "Not authenticated" };

    const [usersRes, reportsRes, bannedRes] = await Promise.all([
      adminAPI.getTotalUsers(token),
      adminAPI.getTotalReports(token),
      userAPI.getAllCheaters(),
    ]);

    return {
      success: true,
      data: {
        users: usersRes.data.totalUsers || 0,
        reports: reportsRes.data.totalReports || 0,
        banned: bannedRes.data.length || 0,
        activeToday: Math.floor(usersRes.data.totalUsers * 0.3) || 0,
        pendingReports: Math.floor(reportsRes.data.totalReports * 0.1) || 0,
        bannedThisMonth: Math.floor(bannedRes.data.length * 0.4) || 0,
      },
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch dashboard stats",
    };
  }
};

export const getGamesChartData = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, message: "Not authenticated" };
    
    const response = await adminAPI.getRecentGames(token);
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const placeholderData = days.map(day => ({ day, games: 0 }));
      return { success: true, data: placeholderData };
    }
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const gameCountByDay = days.map(day => ({ day, games: 0 }));
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    let totalProcessed = 0;
    response.data.forEach(game => {
      if (game.startTime) {
        try {
          const gameDate = new Date(game.startTime);
          if (gameDate >= oneWeekAgo) {
            const dayIndex = gameDate.getDay();
            gameCountByDay[dayIndex].games += 1;
            totalProcessed++;
          }
        } catch (err) {
          console.error("Error processing game date:", err, game.startTime);
        }
      }
    });
    
    return { success: true, data: gameCountByDay };
  } catch (error) {
    console.error("Error getting games chart data:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch games data",
    };
  }
};

export const getRecentAdminActivity = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, message: "Not authenticated" };
    const [recentGamesRes, bannedUsersRes] = await Promise.all([
      adminAPI.getRecentGames(token),
      userAPI.getAllCheaters(),
    ]);

    const activities = generateActivityFeed(
      recentGamesRes.data,
      bannedUsersRes.data
    );
    return { success: true, data: activities };
  } catch (error) {
    console.error("Error getting recent activity:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch recent activity",
    };
  }
};

// ==================== USER MANAGEMENT FUNCTIONS ====================
export const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, message: "Not authenticated" };
    
    // Use the getAllReportedPlayers endpoint instead of getTotalUsers
    const response = await adminAPI.getAllReportedPlayers(token);
    
    if (response.data && Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data, // The direct array of user objects
        pagination: {
          total: response.data.length,
          page,
          limit,
        },
      };
    } else {
      console.error("Invalid response format:", response.data);
      return {
        success: false,
        message: "Invalid response format from server",
        data: [],
      };
    }
  } catch (error) {
    console.error("Error getting all users:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch users",
      data: [],
    };
  }
};

export const banUser = async (userId) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await adminAPI.banPlayer(userId, token);
    return {
      success: true,
      message: "User banned successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error banning user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to ban user",
    };
  }
};

export const unbanUser = async (userId) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await adminAPI.unbanPlayer(userId, token);
    return {
      success: true,
      message: "User unbanned successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to unban user",
    };
  }
};

export const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await userAPI.deleteUser(userId, token);
    return {
      success: true,
      message: "User deleted successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete user",
    };
  }
};

// ==================== REPORTS MANAGEMENT FUNCTIONS ====================
export const getAllReports = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, message: "Not authenticated" };

    // Use the correct reports endpoint instead of getAllReportedPlayers
    const response = await adminAPI.getAllReports(token);
    console.log("Reports data from API:", response.data);
    
    if (!response.data) {
      return { success: false, message: "No reports data returned", data: [] };
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error getting all reports:", error);
    return {
      success: false, 
      message: error.response?.data?.message || "Failed to fetch reports",
      data: []
    };
  }
};

export const getReportsByPlayer = async (playerId) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, message: "Not authenticated" };

    const response = await adminAPI.getPlayerReports(playerId, token);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error getting player reports:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch player reports",
    };
  }
};

export const updateReportStatus = async (reportId, status) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, message: "Not authenticated" };

    // You'd need to create this endpoint in your backend
    const response = await fetch(
      `${BASE_URL}/api/admin/updateReportStatus/${reportId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update report status");
    }

    return { success: true, message: "Report status updated", data };
  } catch (error) {
    console.error("Error updating report status:", error);
    return {
      success: false,
      message: error.message || "Failed to update report status",
    };
  }
};

export const resolveReport = async (reportId) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, message: "Not authenticated" };
    
    const response = await adminAPI.resolveReport(reportId, token);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error resolving report:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Failed to resolve report"
    };
  }
};

export const deleteReport = async (reportId) => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, message: "Not authenticated" };
    
    const response = await adminAPI.deleteReport(reportId, token);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error deleting report:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Failed to delete report"
    };
  }
};

// ==================== BANNED USERS FUNCTIONS ====================
export const getAllBannedUsers = async () => {
  try {
    const response = await userAPI.getAllCheaters();
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error getting banned users:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch banned users",
    };
  }
};

// ==================== UTILITY FUNCTIONS ====================
function processGamesForChart(games) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const gameCountByDay = days.map((day) => ({ day, games: 0 }));

  // Get date 7 days ago
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Count games per day for the last 7 days
  games.forEach((game) => {
    const gameDate = new Date(game.startTime);
    if (gameDate >= oneWeekAgo) {
      const dayIndex = gameDate.getDay();
      gameCountByDay[dayIndex].games += 1;
    }
  });

  return gameCountByDay;
}

function generateActivityFeed(games, bannedUsers) {
  const activity = [];

  // Add recent games (limit to 3)
  games.slice(0, 3).forEach((game, index) => {
    activity.push({
      id: `game-${index}`,
      action: `Game finished: ${game.whiteName} vs ${game.blackName} (${
        game.result || "Unknown result"
      })`,
      user: game.whiteName,
      time: new Date(game.startTime).toLocaleString(),
    });
  });

  // Add recent bans (limit to 2)
  bannedUsers.slice(0, 2).forEach((user, index) => {
    activity.push({
      id: `ban-${index}`,
      action: `User banned for suspicious activity`,
      user: user.name,
      time: "Recently",
    });
  });

  // Sort by most recent first and limit to 5
  return activity
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);
}

// Add this at the end of your file
export const fetchDailyPuzzle = async () => {
  try {
    const response = await puzzleAPI.getDailyPuzzle();
    
    if (!response || response.status === "error") {
      return {
        success: false,
        message: response?.message || "Failed to fetch daily puzzle",
      };
    }
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching daily puzzle:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch daily puzzle",
    };
  }
};
