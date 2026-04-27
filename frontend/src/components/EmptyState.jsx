import React from "react";
import styled from "styled-components";
import { colors } from "../style/style";
import noData from "../assets/images/noData.svg";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
  text-align: center;
`;

const Image = styled.img`
  width: 220px;
  opacity: 0.85;
`;

const Text = styled.h2`
  margin-top: 20px;
  color: ${colors.black};
`;

export const EmptyState = ({ message }) => {
  return (
    <Container>
      <Image src={noData} alt="no data" />
      <Text>{message}</Text>
    </Container>
  );
};