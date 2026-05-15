import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Register } from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { ResetPwd } from "./pages/ResetPwd";
import { NotFound } from "./pages/NotFound";
import { MainLayout } from "./layouts/MainLayout";
import { Profile } from "./pages/Profile";
import { ManageRequests } from "./pages/ManageRequests";
import { ManageUsers } from "./pages/ManageUsers";
import { HomePage } from "./pages/HomePage";
import { UserRequests } from "./pages/UserRequests";
import { ManageCategories } from "./pages/ManageCategories";
import { ManageDonations } from "./pages/ManageDonations";
import { UserDonations } from "./pages/UserDonations";
import { UserInbox } from "./pages/UserInbox";
import { AdminInbox } from "./pages/AdminInbox";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* WITHOUT NAVBAR */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/resetpassword" element={<ResetPwd />} />

        {/* WITH NAVBAR */}
        <Route element={<MainLayout />}>
         {/* //admin specific routes  */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requests" element={<ManageRequests/>} />
          <Route path="/categories" element={<ManageCategories/>} />
          <Route path="/users" element={<ManageUsers />} />
          <Route path="/donations" element={<ManageDonations />} />

         {/* simple user routes */}
          <Route path="/" element={<HomePage/>} />
          <Route path="/requests/:id" element={<UserRequests />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/donations/me" element={<UserDonations />} />


          <Route path="/messages" element={<UserInbox />} />
          <Route path="/admin/inbox" element={<AdminInbox />} />

        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;