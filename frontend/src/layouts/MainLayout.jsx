import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { TopBar } from "../components/TopBar";

export const MainLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      <TopBar />
      <Navbar />
      <div style={{  width: "100%", minHeight:"100vh" }}>
        <Outlet />
      </div>
    </div>
  );
};