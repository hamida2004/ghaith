// Half.jsx
import React from "react";
import styled from "styled-components";
import { colors } from "../style/style";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  height: 100vh;
  flex-direction:column;
  position: absolute;
  top: 0;
  ${({ direction }) => `${direction}: 0;`}
  background-color: ${({ bgc }) => bgc || colors.white};
`;

export const Half = ({ direction, children, bgc }) => {
  return (
    <Container direction={direction} bgc={bgc}>
      {children}
    </Container>
  );
};