import React from 'react'
import styled from 'styled-components';
import { colors } from '../style/style';
import image from '../assets/images/notFound.svg'
import { CustomLink } from '../components/CustomLink';

export const NotFound = () => {


const Title = styled.h1`
  text-align: center;
  color: ${colors.main}
`;
const SubTitle = styled.h2`
  text-align: center;
  color:${colors.black}
`;

  return (
    <div
    style={{
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        width:'100%',
        height:'100vh',


    }}
    >
        <Title>OOOOps !</Title>
        <SubTitle>{` page not found ${`:( `}`}</SubTitle>
     <img src={image} alt="404"
     style={{
        width:"60%",
        margin:40
     }}
     />
     <CustomLink content={"Go back to home page" }
     color={colors.main}
     to={'/'}
     ></CustomLink>
        
    </div>

  )
}
