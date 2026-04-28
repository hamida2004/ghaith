import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../style/style";
import axios from "../api/axios";
import { Button } from "./Button";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  width: 350px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const Info = styled.p`
  font-size: 13px;
  color: ${colors.main};
  margin-top: 5px;
`;

export const DonationModal = ({ request, onClose, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    const value = parseFloat(amount);

    if (!value || value <= 0) {
      return alert("Invalid amount");
    }

    try {
      setLoading(true);

      await axios.post("/donations", {
        request_id: request.id,
        amount: value
      });

      alert("Donation sent. Waiting for confirmation.");
      onSuccess();

    } catch (err) {
      console.error(err);
      alert("Donation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay>
      <Modal>
        <h3>Donate to</h3>
        <p>{request.title}</p>

        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Info>
          This donation will be confirmed by the request owner.
        </Info>

        <div
        style={{
          display:'flex',
          width:"100%",
          alignItems:'center',
          justifyContent:'space-between',
          padding:'auto'
        }}
        >
          <Button
          content={loading ? "Processing..." : "Confirm"}
          handleClick={handleDonate}
        />

        <Button content="Cancel" handleClick={onClose} />

        </div>
              </Modal>
    </Overlay>
  );
};