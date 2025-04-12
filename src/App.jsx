import OnlineGame from "./Components/OnlineGame";
import LocalGame from "./Components/localGame";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LocalGamePage from "./Components/localGamePage";
import ProtectedRoute from "./Components/ProtectedRoutes";
import Home from "./landing/Home";
import Signup from "./Authentication/Signup";
import Login from "./Authentication/Login";
import ForgotPassword from "./Authentication/ForgotPassword";
import UpdatePassword from "./Authentication/UpdatePassword";
import PlayWithEngine from "./engine/PlayWithEngine";
import FuzzyText from "./utils/Error";
import Dashboard from "./Admin/Dashboard";
import Users from "./Admin/Users";
import Banned from "./Admin/Banned";
import Reports from "./Admin/Reports";
import Adminhome from "./Admin/Adminhome";
import AdminLogin from "./Admin/AdminLogin";
import ProtectedAdmin from "./Admin/ProtectedAdmin";
import Verify from "./Authentication/Verify";
import VerifyConfirmation from "./Authentication/VerifyConfirmation";
import Userdashboard from "./Users/Userdashboard";
import ResultPage from "./Components/ResultPage";
import RecentGames from "./Users/RecentGames";

function App() {
  const hoverIntensity = 0.5;
  const enableHover = true;

  return (
    <div>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/verify" element={<Verify />}></Route>
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />}></Route>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password/:id" element={<UpdatePassword />} />
          <Route path="/verify-email/:token" element={<VerifyConfirmation />} />

          <Route path="/localgame/:gameId" element={<LocalGame />} />
          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <OnlineGame />
              </ProtectedRoute>
            }
          ></Route>
          <Route path="/localgamePage" element={<LocalGamePage />}></Route>
          <Route
            path="/chess"
            element={
              <ProtectedRoute>
                <PlayWithEngine />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="flex flex-col gap-10 items-center justify-center h-full w-full">
                <FuzzyText
                  baseIntensity={0.2}
                  hoverIntensity={hoverIntensity}
                  enableHover={enableHover}
                >
                  404
                </FuzzyText>
                <FuzzyText
                  baseIntensity={0.2}
                  hoverIntensity={hoverIntensity}
                  enableHover={enableHover}
                  fontSize="70px"
                  fontWeight={700}
                >
                  not found
                </FuzzyText>
              </div>
            }
          />
          <Route
            element={
              <ProtectedAdmin>
                <Dashboard />
              </ProtectedAdmin>
            }
          >
            <Route path="dashboard/admin" element={<Adminhome />} />
            <Route path="dashboard/admin/users" element={<Users />} />
            <Route path="dashboard/admin/banned" element={<Banned />} />
            <Route path="dashboard/admin/reports" element={<Reports />} />
          </Route>
          <Route path="admin/login" element={<AdminLogin />} />
          <Route
            path="/dashboard-pannel"
            element={
              <ProtectedRoute>
                <Userdashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/game/result/:roomId"
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            }
          />
          <Route path="/game/recentGames/:playerId" element={<RecentGames />} />
          
        </Routes>

      </BrowserRouter>
    </div>
  );
}

export default App;
