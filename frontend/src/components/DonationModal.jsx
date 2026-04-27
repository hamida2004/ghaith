import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../style/style";

// =====================
// STYLES
// =====================
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Title = styled.h3`
  text-align: center;
  color: ${colors.main};
  margin-bottom: 10px;
`;

const Description = styled.p`
  text-align: center;
  color: #666;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 14px;
  border-radius: 25px;
  border: 1px solid #ddd;
  outline: none;
  font-size: 14px;

  &:focus {
    border-color: ${colors.main};
    box-shadow: 0 0 5px ${colors.main}40;
  }
`;

const InfoBox = styled.div`
  background: ${colors.main}10;
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  color: ${colors.main};
  text-align: center;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;

  background: ${(props) =>
    props.variant === "secondary" ? "#eee" : colors.main};

  color: ${(props) =>
    props.variant === "secondary" ? "#333" : "white"};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// =====================
// COMPONENT
// =====================
export const DonationModal = ({ request, onClose }) => {
  const [amount, setAmount] = useState("");

  const remaining = request.target_amount - request.collected_amount;

  const handleDonate = () => {
    if (!amount || amount <= 0) return;

    alert(`Donated ${amount}`);
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        
        <Title>{request.title}</Title>
        <Description>{request.description}</Description>

        <InfoBox>
          Remaining: {remaining} DA
        </InfoBox>

        <Input
          type="number"
          placeholder="Enter donation amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Actions>
          <Button
            onClick={handleDonate}
            disabled={!amount || amount <= 0}
          >
            Confirm
          </Button>

          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </Actions>

      </Modal>
    </Overlay>
  );
};