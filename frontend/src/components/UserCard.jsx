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
  color: ${colors.main};
`;

const Details = styled.div`
  margin-top: 10px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: ${colors.main};
  color: white;

  &:hover {
    opacity: 0.9;
  }
`;

// =====================
// COMPONENT
// =====================
export const UserCard = ({ user, onPromote, onVerify }) => {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <Header onClick={() => setOpen(!open)}>
        <div>
          <Title>{user.name}</Title>
          <p>{user.email}</p>
        </div>
        <Badge>{user.role}</Badge>
      </Header>

      {open && (
        <Details>
          <p><strong>Type:</strong> {user.type}</p>
          <p><strong>Status:</strong> {user.status}</p>
          <p><strong>Documents:</strong> {user.documents.length}</p>

          <Actions>
            <Button onClick={() => onVerify(user)}>
              Verify Docs
            </Button>

            {user.role !== "admin" && (
              <Button onClick={() => onPromote(user)}>
                Make Admin
              </Button>
            )}
          </Actions>
        </Details>
      )}
    </Card>
  );
};