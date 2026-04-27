import React from "react";
import styled from "styled-components";
import { colors } from "../style/style";
import { Button } from "./Button";

const Card = styled.div`
  background: white;
  padding: 16px;
  margin-bottom: 10px;
  border-radius: 10px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:20px
`;



export const RequestCard = ({ request, onDonate }) => {
  return (
    <Card>
      <div>
       <h4>{request.title}</h4>
       <p>{request.category}</p>
       <p>{request.donation_status}</p>

      </div>
      <Button
      onClick={onDonate}
      content={"Donate"}/>
    </Card>
  );
};