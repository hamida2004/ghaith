import React from 'react'
import styled from 'styled-components'
import { colors } from '../style/style'

// =====================
// STYLES (OUTSIDE)
// =====================
const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  outline: none;
  border: none;
  color: ${colors.white};
  background-color: ${colors.main};
  box-shadow: 0px 0px 4px ${colors.main};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: 0.2s;

  &:hover {
    cursor: pointer;
    opacity: 0.9;
  }

  &:disabled {
    background-color: #ccc;
    box-shadow: none;
    cursor: not-allowed;
  }
`;

// =====================
// COMPONENT
// =====================
export const Button = ({ content, handleClick, disabled = false, type = "button" }) => {
  return (
    <StyledButton
      onClick={handleClick}
      disabled={disabled}
      type={type}
    >
      {content}
    </StyledButton>
  );
};