import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

export const CustomLink = ({color,to,content}) => {
    const navigate=useNavigate() 
    
    const CustomLink = styled(Link)`
    color: ${color};
    font-size:16 ;
    font-weight:600;
    text-align:left;
    text-decoration:none;

    `
  return (
    <CustomLink to={to}>
         {content}
    </CustomLink>
  )
}
