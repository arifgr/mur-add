import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import "./common/i18n";
import { Toaster } from "react-hot-toast";

const App = () => {
  const isSellerPath = useLocation().pathname.includes("seller");
  return (
    <div>
      {isSellerPath ? null : <Navbar />}
      <Toaster />
      <div
        className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-34"}`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
      {isSellerPath ? null : <Footer />}
    </div>
  );
};

export default App;
