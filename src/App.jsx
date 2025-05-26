// App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Registro from "./components/Register";
import Login from "./components/Login";
import PrincipalPage from "./components/PrincipalPage";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<PrincipalPage />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
