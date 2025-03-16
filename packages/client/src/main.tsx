// src/main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";
import Login from "./pages/login";
import Register from "./pages/register";
import { Navbar } from "./components/layout/Navbar";
import CreatePixelBoardPage from "./pages/CreatePixelBoardPage";
import PixelBoardList from "./pages/PixelBoardList";
import EditPixelBoardPage from "./pages/EditPixelBoardPage";
import Unauthorized from "./pages/Unauthorized";

import "./index.css";
import ProtectedRoute from "./components/ProtectedRoute";

createRoot(document.getElementById("root")!).render(
      <BrowserRouter>
            <AuthProvider>
                  <div className="flex flex-col h-screen w-screen">
                        <Navbar />
                        <Routes>
                              <Route path="/" element={<App />} />
                              <Route path="/login" element={<Login />} />
                              <Route path="/register" element={<Register />} />
                              <Route path="/pixel-boards" element={<ProtectedRoute element={<PixelBoardList />} roles={['admin', 'user']} />} />
                              <Route path="/pixel-boards/create" element={<ProtectedRoute element={<CreatePixelBoardPage />} roles={['admin']} />} />
                              <Route path="/pixel-boards/edit/:id" element={<ProtectedRoute element={<EditPixelBoardPage />} roles={['admin']} />} />
                              <Route path="/unauthorized" element={<Unauthorized />} />
                        </Routes>
                  </div>
            </AuthProvider>
    </BrowserRouter>
);