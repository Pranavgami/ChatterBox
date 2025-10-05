import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContxt";

export default function App() {
  const { authUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }
  return (
    <div
      className={`bg-[url('./src/assets/bgImage.svg')] bg-center bg-contain `}
    >
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route
          path="/"
          element={authUser ? <Home /> : <Navigate to="/login" />}
        ></Route>
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/" />}
        ></Route>
        <Route
          path="/profile"
          element={authUser ? <Profile /> : <Navigate to="/login" />}
        ></Route>
      </Routes>
    </div>
  );
}
