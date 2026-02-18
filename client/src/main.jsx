import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
       <Route path="/" element={<Login />} />
       <Route path="/signup" element={<Signup />} />
    </Routes>
  </BrowserRouter>
);