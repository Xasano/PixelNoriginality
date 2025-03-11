import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Navbar } from "./components/layout/Navbar";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <div className="flex flex-col h-screen w-screen">
      <Navbar />
      <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  </BrowserRouter>
);
