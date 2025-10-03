import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import assets from "./assets/assets";

export default function App() {
  return (
    <BrowserRouter>
      <div
        className={`bg-[url('./src/assets/bgImage.svg')] bg-center bg-contain `}
      >
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/profile" element={<Profile />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
