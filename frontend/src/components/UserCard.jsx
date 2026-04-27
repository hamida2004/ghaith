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
  color: white;
  background-color: ${props => props.bg};
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

  &:hover {
    opacity: 0.9;
  }
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
  onRejectDoc
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      {/* HEADER */}
      <Header onClick={() => setOpen(!open)}>
        <div>
          <Title>{user.name}</Title>
          <p>{user.email}</p>
        </div>

        <Badge bg={getStatusColor(user.status)}>
          {user.is_admin ? "Admin" : "User"}
        </Badge>
      </Header>

      {/* DETAILS */}
      {open && (
        <Details>
          <p><strong>Type:</strong> {user.type}</p>
          <p><strong>Status:</strong> {user.status}</p>
          <p><strong>Documents:</strong> {user.Documents?.length || 0}</p>

          {/* =====================
              DOCUMENTS
          ===================== */}
          {user.Documents?.map(doc => (
            <div key={doc.id}>
              <p>Doc status: {doc.status}</p>

              {doc.status === "pending" && (
                <>
                  <Button onClick={() => onApproveDoc(doc.id)}>
                    Approve
                  </Button>

                  <Button
                    bg={colors.red}
                    onClick={() => onRejectDoc(doc.id)}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          ))}

          {/* =====================
              USER ACTIONS
          ===================== */}
          <Actions>
            <Button onClick={onToggleAdmin}>
              {user.is_admin ? "Remove Admin" : "Make Admin"}
            </Button>

            {user.status !== "active" && (
              <Button bg={colors.green} onClick={onActivate}>
                Activate
              </Button>
            )}

            {user.status !== "rejected" && (
              <Button bg={colors.red} onClick={onReject}>
                Reject
              </Button>
            )}
          </Actions>
        </Details>
      )}
    </Card>
  );
};