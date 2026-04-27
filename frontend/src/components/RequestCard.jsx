import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../style/style";

// =====================
// STYLES
// =====================
const Card = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`;

const Title = styled.h4`
  margin: 0;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 16px;
  color: ${props => props.color || "#eee"};
`;

const Details = styled.div`
  margin-top: 10px;
  font-size: 14px;
`;

const Row = styled.div`
  margin: 5px 0;
`;

// =====================
// COMPONENT
// =====================
export const RequestCard = ({ request }) => {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <Header onClick={() => setOpen(!open)}>
        <div>
          <Title>{request.title}</Title>
          <p>{request.user.name} • {request.category}</p>
        </div>

        <div>
          <Badge color={request.status == "pending" ? colors.yellow : request.status == "refused" ? colors.red : colors.green}>{request.status}</Badge>
        </div>
      </Header>

      {open && (
        <Details>
          <Row><strong>Description:</strong> {request.description}</Row>
          <Row><strong>Target:</strong> {request.target_amount}</Row>
          <Row><strong>Collected:</strong> {request.collected_amount}</Row>
          <Row><strong>Donation Status:</strong> {request.donation_status}</Row>
          <Row><strong>Type:</strong> {request.type}</Row>
          <Row><strong>Date:</strong> {request.date}</Row>
        </Details>
      )}
    </Card>
  );
};