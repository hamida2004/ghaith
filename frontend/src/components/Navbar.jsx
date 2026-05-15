import React, {
  useEffect,
  useState
} from "react";

import styled from "styled-components";

import { colors } from "../style/style";

import {
  FaHome,
  FaUser,
  FaBars,
  FaUsers
} from "react-icons/fa";

import {
  BiExit
} from "react-icons/bi";

import {
  IoClose
} from "react-icons/io5";

import {
  MdOutlineDashboard,
  MdCategory,
  MdVolunteerActivism,
  MdOutlineRequestPage
} from "react-icons/md";

import {
  HiOutlineDocumentText
} from "react-icons/hi";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

// =====================
// STYLES
// =====================
const Nav = styled.div`
  position: fixed;
  top: 0;
  left: 0;

  height: 90vh;

  margin-top: 60px;

  width: ${(props) =>
    props.open
      ? "220px"
      : "75px"};

  background-color:
    ${colors.white};

  transition: 0.3s;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  box-shadow:
    0 0 10px
    rgba(0,0,0,0.1);

  padding: 20px 0;

  z-index: 100;
`;

const Toggle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;

  font-size: 22px;

  margin-bottom: 30px;

  color: ${colors.main};
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledLink = styled(NavLink)`
  display: flex;
  align-items: center;

  gap: 14px;

  padding: 14px 18px;

  text-decoration: none;

  color: ${colors.main};

  transition: 0.2s;

  font-size: 15px;

  &:hover {
    background-color:
      ${colors.main}15;
  }

  &.active {

    background-color:
      ${colors.main}25;

    border-left:
      4px solid
      ${colors.main};

    font-weight: 600;
  }

  svg {
    font-size: 20px;
    min-width: 20px;
  }
`;

const Label = styled.span`
  display: ${(props) =>
    props.open
      ? "inline"
      : "none"};

  white-space: nowrap;
`;

// =====================
// COMPONENT
// =====================
export const Navbar = () => {

  const [open, setOpen] =
    useState(false);

  const [user, setUser] =
    useState(null);

  const navigate =
    useNavigate();

  // =====================
  // DECODE TOKEN
  // =====================
  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {

      navigate("/login");

      return;
    }

    try {

      const payload =
        JSON.parse(
          atob(
            token.split(".")[1]
          )
        );

      setUser(payload);

    } catch {

      console.error(
        "Invalid token"
      );

      localStorage.removeItem(
        "token"
      );

      navigate("/login");
    }

  }, [navigate]);

  // =====================
  // LOGOUT
  // =====================
  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    navigate("/login");
  };

  // =====================
  // LOADING
  // =====================
  if (!user) {
    return null;
  }

  // =====================
  // ROLES
  // =====================
  const isAdmin =
    user.is_admin === true;

  const isDonator =
    user.role ===
    "donator";

  const isSeeker =
    user.role ===
    "seeker";

  // =====================
  // UI
  // =====================
  return (
    <Nav open={open}>

      {/* TOP */}
      <div>

        {/* TOGGLE */}
        <Toggle
          onClick={() =>
            setOpen(!open)
          }
        >

          {!open ? (

            <FaBars />

          ) : (

            <IoClose
              color={colors.red}
            />

          )}

        </Toggle>

        {/* MENU */}
        <Menu>

          {/* =====================
              ADMIN NAV
          ===================== */}
          {isAdmin && (
            <>

              <StyledLink
                to="/dashboard"
              >

                <MdOutlineDashboard />

                <Label open={open}>
                  Dashboard
                </Label>

              </StyledLink>

              <StyledLink
                to="/requests"
              >

                <MdOutlineRequestPage />

                <Label open={open}>
                  Requests
                </Label>

              </StyledLink>

              <StyledLink
                to="/users"
              >

                <FaUsers />

                <Label open={open}>
                  Users
                </Label>

              </StyledLink>

              <StyledLink
                to="/categories"
              >

                <MdCategory />

                <Label open={open}>
                  Categories
                </Label>

              </StyledLink>

              <StyledLink
                to="/donations"
              >

                <MdVolunteerActivism />

                <Label open={open}>
                  Donations
                </Label>

              </StyledLink>

            </>
          )}

          {/* =====================
              SEEKER NAV
          ===================== */}
          {!isAdmin &&
            isSeeker && (
            <>

              <StyledLink
                to="/requests/me"
              >

                <HiOutlineDocumentText />

                <Label open={open}>
                  My Requests
                </Label>

              </StyledLink>

              <StyledLink
                to="/profile"
              >

                <FaUser />

                <Label open={open}>
                  Profile
                </Label>

              </StyledLink>

            </>
          )}

          {/* =====================
              DONATOR NAV
          ===================== */}
          {!isAdmin &&
            isDonator && (
            <>

              <StyledLink
                to="/"
              >

                <FaHome />

                <Label open={open}>
                  Home
                </Label>

              </StyledLink>

              <StyledLink
                to="/donations/me"
              >

                <MdVolunteerActivism />

                <Label open={open}>
                  My Donations
                </Label>

              </StyledLink>

              <StyledLink
                to="/profile"
              >

                <FaUser />

                <Label open={open}>
                  Profile
                </Label>

              </StyledLink>

            </>
          )}

        </Menu>

      </div>

      {/* LOGOUT */}
      <div
        style={{
          marginBottom: 20
        }}
      >

        <StyledLink
          as="div"
          onClick={
            handleLogout
          }
          style={{
            color: colors.red,
            cursor: "pointer"
          }}
        >

          <BiExit />

          <Label open={open}>
            Logout
          </Label>

        </StyledLink>

      </div>

    </Nav>
  );
};