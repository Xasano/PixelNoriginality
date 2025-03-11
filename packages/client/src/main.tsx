import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App";
import Login from "./pages/login";
import Register from "./pages/register";
import { Navbar } from "./components/layout/Navbar";
import CreatePixelBoardPage from "./pages/CreatePixelBoardPage";
import PixelBoardList from "./pages/PixelBoardList";
import PixelBoardDetail from "./pages/PixelBoardDetail";
import EditPixelBoardPage from "./pages/EditPixelBoardPage";

import "./index.css";

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <div className="flex flex-col h-screen w-screen">
            <Navbar />
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/pixel-boards" element={<PixelBoardList />} />
                <Route path="/pixel-boards/:id" element={<PixelBoardDetail />} />
                <Route path="/pixel-boards/create" element={<CreatePixelBoardPage />} />
                <Route path="/pixel-boards/edit/:id" element={<EditPixelBoardPage />} />
            </Routes>
        </div>
    </BrowserRouter>
);