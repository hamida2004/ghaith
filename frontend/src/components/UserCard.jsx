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
  font-size: 13px;
  color: ${props => props.bg};
`;

const Details = styled.div`
  margin-top: 10px;
  font-size: 14px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: ${props => props.bg || colors.main};
  color: white;
`;

// =====================
// HELPERS
// =====================
const getStatusColor = (status) => {
  if (status === "active") return colors.green;
  if (status === "pending") return colors.yellow;
  if (status === "rejected") return colors.red;
  return "#999";
};

// =====================
// COMPONENT
// =====================
export const UserCard = ({
  user,
  onToggleAdmin,
  onActivate,
  onReject,
  onApproveDoc,
  onRejectDoc,
  onViewDoc
}) => {
  const [open, setOpen] = useState(false);

  const doc = user.Documents?.[0];

  return (
    <Card>
      <Header onClick={() => setOpen(!open)}>
        <div>
          <Title>{user.name}</Title>
          <p>{user.email}</p>
        </div>

        <Badge bg={getStatusColor(user.status)}>
          {user.is_admin ? "Admin" : "User"}
        </Badge>
      </Header>

      {open && (
        <Details>
          <p><strong>Type:</strong> {user.type}</p>
          <p><strong>Status:</strong> {user.status}</p>

          <p><strong>Document:</strong> {doc ? doc.status : "None"}</p>

          <Actions>

            {/* VIEW */}
            {doc && (
              <Button onClick={() => onViewDoc(doc.file_path)}>
                View Document
              </Button>
            )}

            {/* APPROVE */}
            {doc && doc.status === "pending" && (
              <Button bg={colors.green} onClick={() => onApproveDoc(doc.id)}>
                Approve
              </Button>
            )}

            {/* REJECT */}
            {doc && doc.status === "pending" && (
              <Button bg={colors.red} onClick={() => onRejectDoc(doc.id)}>
                Reject
              </Button>
            )}

            {/* ACTIVATE */}
            {user.status !== "active" && (
              <Button bg={colors.green} onClick={onActivate}>
                Activate
              </Button>
            )}

            {/* REJECT USER */}
            {user.status !== "rejected" && (
              <Button bg={colors.red} onClick={onReject}>
                Reject User
              </Button>
            )}

            {/* ADMIN */}
            <Button onClick={onToggleAdmin}>
              {user.is_admin ? "Remove Admin" : "Make Admin"}
            </Button>

          </Actions>
        </Details>
      )}
    </Card>
  );
};