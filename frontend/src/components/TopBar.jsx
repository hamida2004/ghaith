import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { colors } from '../style/style'
import logo from '../assets/images/logo.png'
import { Link } from 'react-router-dom'
import { IoPersonCircle } from 'react-icons/io5'
import axios from '../api/axios'

// =====================
// STYLES (OUTSIDE COMPONENT - IMPORTANT)
// =====================
const Bar = styled.div`
  width: 100%;
  height: 60px;
  z-index: 999;
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${colors.white};
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  padding: 0px 20px;
`;

// =====================
// COMPONENT
// =====================
export const TopBar = () => {
  const [user, setUser] = useState(null);

  // =====================
  // FETCH USER
  // =====================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/users/me");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <Bar>
      {/* LOGO */}
      <Link to="/">
        <img
          style={{ width: 60 }}
          src={logo}
          alt="ghaith logo"
        />
      </Link>

      {/* USER */}
      {user && (
        <Link
          to={`/profile`}   // ✅ no need for /:id if backend uses token
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            textDecoration: 'none',
            color: colors.grey,
            marginRight: 20
          }}
        >
          <p>{user.name}</p> {/* ✅ dynamic name */}
          <IoPersonCircle size={28} color={colors.grey} />
        </Link>
      )}
    </Bar>
  );
};