import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../style/style";
import { Button } from "./Button";

// =====================
// HELPERS
// =====================
const getStatusColor = (status) => {
  if (status === "pending") return colors.yellow;
  if (status === "refused") return colors.red;
  if (status === "accepted") return colors.green;
  return "#999";
};

const getUrgencyColor = (urgency) => {
  if (urgency >= 4) return colors.red;
  if (urgency >= 2) return colors.yellow;
  return colors.green;
};

// 🔥 NEW: shadow based on urgency
const getUrgencyShadow = (urgency) => {
  if (urgency >= 4) return "0 0 12px rgba(255,0,0,0.4)";
  if (urgency >= 2) return "0 0 10px rgba(255,165,0,0.4)";
  return "0 0 8px rgba(0,128,0,0.3)";
};

// =====================
// STYLES
// =====================
const Card = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;

  /* 🔥 dynamic shadow */
  box-shadow: ${(p) => getUrgencyShadow(p.urgency)};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Title = styled.h4`
  margin: 0;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
  color: white;
  background: ${(p) => p.bg};
`;

const Details = styled.div`
  margin-top: 10px;
  font-size: 14px;
`;

const Row = styled.div`
  margin: 6px 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
`;

// =====================
// COMPONENT
// =====================
export const RequestCard = ({
  request,
  onAccept,
  onRefuse,
  onDonate,
  isAdmin = false,
  isDonator = false
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Card urgency={request.urgency}>
      {/* HEADER */}
      <Header onClick={() => setOpen(!open)}>
        <div>
          {/* 🔥 TITLE + URGENCY */}
          <TitleRow>
            <Title>{request.title}</Title>

            <Badge bg={getUrgencyColor(request.urgency)}>
              {request.urgency}/5
            </Badge>
          </TitleRow>

          <p>
            {request.User?.name || "Unknown"} •{" "}
            {request.Category?.name || "No category"}
          </p>
        </div>

        {/* STATUS */}
        <Badge bg={getStatusColor(request.status)}>
          {request.status}
        </Badge>
      </Header>

      {/* DETAILS */}
      {open && (
        <Details>
          <Row><strong>Description:</strong> {request.description}</Row>

          <Row>
            <strong>Target:</strong> {request.target_amount}
          </Row>

          <Row>
            <strong>Collected:</strong> {request.collected_amount}
          </Row>

          <Row>
            <strong>Donation Status:</strong> {request.donation_status}
          </Row>

          <Row>
            <strong>Type:</strong> {request.type}
          </Row>

          <Row>
            <strong>Phone:</strong> {request.phone}
          </Row>

          <Row>
            <strong>Address:</strong> {request.address}
          </Row>

          <Row>
            <strong>Occupation:</strong> {request.occupation}
          </Row>

          {/* DOCUMENT */}
          <Row>
            <strong>Document:</strong>{" "}
            {request.document ? (
              <a
                href={`https://ghaith-gtkr.onrender.com${request.document}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Document
              </a>
            ) : (
              "N/A"
            )}
          </Row>

          <Row>
            <strong>Date:</strong>{" "}
            {request.createdAt
              ? new Date(request.createdAt).toLocaleDateString()
              : "N/A"}
          </Row>

          {/* ACTIONS */}
          <Actions>
            {isAdmin && request.status === "pending" && (
              <>
                <Button content="Accept" handleClick={onAccept} />
                <Button
                  content="Refuse"
                  handleClick={onRefuse}
                  color={colors.red}
                />
              </>
            )}

            {isDonator &&
              request.status === "accepted" &&
              request.donation_status !== "satisfied" && (
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