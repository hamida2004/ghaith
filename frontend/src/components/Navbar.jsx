import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../style/style";
import { FaHome, FaDonate, FaUser, FaBars, FaUsers } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { BiExit } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { MdOutlineDashboard } from "react-icons/md";

// =====================
// MOCK ROLE (replace later with token)
// =====================
const mockUser = {
  role: "admin" // change to "user" to test
};

// =====================
// STYLES
// =====================
const Nav = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 90vh;
  margin-top: 60px;
  width: ${(props) => (props.open ? "200px" : "70px")};
  background-color: ${colors.white};
  transition: 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  padding: 20px 0;
`;

const Toggle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 20px;
  margin-bottom: 30px;
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: flex-start; /* LEFT ALIGN */
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: ${colors.main};
  transition: 0.2s;

  &:hover {
    background-color: ${colors.main}20;
  }

  &.active {
    background-color: ${colors.main}30;
    border-left: 4px solid ${colors.main};
    font-weight: 600;
  }
`;

const Label = styled.span`
  display: ${(props) => (props.open ? "inline" : "none")};
  white-space: nowrap;
`;

// =====================
// COMPONENT
// =====================
export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const isAdmin = mockUser.role === "admin";

  return (
    <Nav open={open}>
      
      {/* TOP */}
      <div>
        <Toggle onClick={() => setOpen(!open)}>
          {!open ? <FaBars /> : <IoClose color={colors.red} />}
        </Toggle>

        <Menu>
          {/* =====================
              ADMIN ROUTES
          ===================== */}
          {isAdmin && (
            <>
              <StyledLink to="/" end>
                <FaHome />
                <Label open={open}>Home</Label>
              </StyledLink>

              <StyledLink to="/dashboard">
                <MdOutlineDashboard />
                <Label open={open}>Dashboard</Label>
              </StyledLink>

              <StyledLink to="/requests">
                <FaDonate />
                <Label open={open}>Manage Requests</Label>
              </StyledLink>

              <StyledLink to="/users">
                <FaUsers />
                <Label open={open}>Manage Users</Label>
              </StyledLink>
            </>
          )}

          {/* =====================
              USER ROUTES
          ===================== */}
          {!isAdmin && (
            <>
              <StyledLink to="/" end>
                <FaHome />
                <Label open={open}>Home</Label>
              </StyledLink>

              <StyledLink to="/requests/1">
                <FaDonate />
                <Label open={open}>My Requests</Label>
              </StyledLink>

              <StyledLink to="/profile/1">
                <FaUser />
                <Label open={open}>Profile</Label>
              </StyledLink>
            </>
          )}
        </Menu>
      </div>

      {/* LOGOUT */}
      <div style={{ marginBottom: 20 }}>
        <StyledLink to="/logout" style={{ color: colors.red }}>
          <BiExit />
          <Label open={open}>Logout</Label>
        </StyledLink>
      </div>

    </Nav>
  );
};