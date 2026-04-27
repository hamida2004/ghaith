import React from 'react'
import styled from 'styled-components'
import { colors } from '../style/style'
import { CustomLink } from './CustomLink'
import logo from '../assets/images/logo.png'
import { Link } from 'react-router-dom'
import { IoPersonCircle } from 'react-icons/io5'
import { Button } from './Button'

export const TopBar = () => {

    const Bar = styled.div`
    width:100%;
    height:60px;
    z-index:999;
    position: fixed;
    display:flex;
    align-items:center;
    justify-content:space-between;
    background-color: ${colors.white};
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    padding: 0px 20px;

    `
    const id = 1;
  return (
   <Bar>
    <Link
    to='/'
    >
    <img 
    style={{
        width:60
    }}
    src={logo}
    alt='ghaith logo'
    />
    </Link>
    <Link
    style={{
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        gap:8,
        textDecoration:'none',
        color:colors.grey,
        marginRight:20
    }}
    to={`/profile/${id}`}

    >
        <p>Profile</p>
    <IoPersonCircle
    size={28}
    color={colors.grey}
    />
    </Link>
    
   </Bar>
  )
}
