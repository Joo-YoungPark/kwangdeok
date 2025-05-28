// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Main from "./pages/Main";
import Login from "./pages/Login";

import UserMain from "./pages/user/UserMain";
import UserRecord from "./pages/user/userContent/UserRecord";
import UserCalendar from "./pages/user/userContent/UserCalendar";
import UserState from "./pages/user/userContent/UserState";

import AdminMain from "./pages/admin/AdminMain";
import AdminRecord from "./pages/admin/adminContent/AdminRecord";
import AdminMember from "./pages/admin/adminContent/AdminMember";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        {/* 유저 */}
        <Route path="/user" element={<UserMain />}>
          <Route index element={<Navigate to="userRecord" />} />
          <Route path="userRecord" element={<UserRecord />} />
          <Route path="calendar" element={<UserCalendar />} />
          <Route path="state" element={<UserState />} />
        </Route>
        {/* 관리자 */}
        <Route path="/admin" element={<AdminMain />}>
          <Route index element={<Navigate to="adminRecord" />} />
          <Route path="adminRecord" element={<AdminRecord />} />
          <Route path="member" element={<AdminMember />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
