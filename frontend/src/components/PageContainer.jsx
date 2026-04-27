import React from 'react'
import styled from 'styled-components'
import { colors } from '../style/style'

// ✅ DEFINE OUTSIDE COMPONENT
const Container = styled.div`
  padding: 80px;
  background-color: ${colors.white};
  height: 100vh;
`;

export const PageContainer = ({ children }) => {
  return (
    <Container>
      {children}
    </Container>
  );
};