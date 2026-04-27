import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../style/style";

// =====================
// STYLES
// =====================
const Wrapper = styled.div`
  position: relative;
  width: 100%;
  margin: 12px 0;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 14px 12px;
  border: 2px solid #ccc;
  border-radius: 8px;
  outline: none;
  font-size: 16px;
  background: transparent;

  &:focus {
    border-color: ${colors.main};
  }

  &:focus + label,
  &:not(:placeholder-shown) + label {
    top: -8px;
    left: 10px;
    font-size: 12px;
    color: ${colors.main};
    background: white;
    padding: 0 4px;
  }
`;

const Label = styled.label`
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: #888;
  font-size: 14px;
  pointer-events: none;
  transition: 0.3s ease all;
`;

// =====================
// COMPONENT
// =====================
export const Input = ({ label, type = "text", value, onChange }) => {
  return (
    <Wrapper>
      <StyledInput
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" " // IMPORTANT (enables :placeholder-shown)
      />
      <Label>{label}</Label>
    </Wrapper>
  );
};