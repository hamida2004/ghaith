import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../style/style";
import { Button } from "./Button";

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


const Details = styled.div`
  margin-top: 10px;
  font-size: 14px;
`;

const Row = styled.div`
  margin: 5px 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

// =====================
// HELPERS
// =====================
const getStatusColor = (status) => {
  if (status === "pending") return colors.yellow;
  if (status === "refused") return colors.red;
  if (status === "accepted") return colors.green;
  return "#999";
};

// =====================
// COMPONENT
// =====================
export const RequestCard = ({
  request,
  onAccept,
  onRefuse,
  onDonate,
  isAdmin = false
}) => {
  const [open, setOpen] = useState(false);
  console.log("888888 ",request)
  return (
    <Card>
      <Header onClick={() => setOpen(!open)}>
        <div>
          <Title>{request.title}</Title>

          <p>
            {request.User?.name || "Unknown"} •{" "}
            {request.Category?.name || request.category || "No category"}
          </p>
        </div>

        
      </Header>

      {open && (
        <Details>
          <Row><strong>Description:</strong> {request.description}</Row>
          <Row><strong>Target:</strong> {request.target_amount}</Row>
          <Row><strong>Collected:</strong> {request.collected_amount}</Row>
          <Row><strong>Donation Status:</strong> {request.donation_status}</Row>
          <Row><strong>Type:</strong> {request.type}</Row>
          <Row>
            <strong>Date:</strong>{" "}
            {request.createdAt
              ? new Date(request.createdAt).toLocaleDateString()
              : "N/A"}
          </Row>

          <Actions>
            {/* =====================
                ADMIN ACTIONS
            ===================== */}
            {isAdmin && request.status === "pending" && (
              <>
                <Button content="Accept" handleClick={onAccept} />
                <Button
                  content="Refuse"
                  handleClick={onRefuse}
                  style={{ background: colors.red }}
                />
              </>
            )}

            {/* =====================
                USER ACTION
            ===================== */}
            {!isAdmin && onDonate && request.donation_status !== "satisfied" && (
              <Button
                content="Donate"
                handleClick={() => onDonate(request)}
              />
            )}
          </Actions>
        </Details>
      )}
    </Card>
  );
};