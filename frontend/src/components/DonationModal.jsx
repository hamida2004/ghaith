import React, {
  useState
} from "react";

import styled from "styled-components";

import { colors } from "../style/style";

import axios from "../api/axios";

import { Button } from "./Button";

// =====================
// STYLES
// =====================
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  width: 400px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 10px 0;

  border-radius: 8px;
  border: 1px solid #ddd;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 110px;

  padding: 12px;
  margin: 10px 0;

  border-radius: 8px;
  border: 1px solid #ddd;

  resize: vertical;
  font-family: inherit;
`;

const Info = styled.p`
  font-size: 13px;
  color: ${colors.main};
  margin-top: 5px;
`;

const ToggleContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 15px 0;
`;

const ToggleButton = styled.button`
  flex: 1;

  padding: 10px;

  border: none;
  border-radius: 8px;

  cursor: pointer;

  font-weight: 600;

  background: ${(p) =>
    p.$active
      ? colors.main
      : "#f0f0f0"};

  color: ${(p) =>
    p.$active
      ? "white"
      : "#333"};
`;

// =====================
// COMPONENT
// =====================
export const DonationModal = ({
  request,
  onClose,
  onSuccess
}) => {

  const [amount, setAmount] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // targeted if opened from request
  const [mode, setMode] =
    useState(
      request
        ? "targeted"
        : "free"
    );

  // =====================
  // SUBMIT
  // =====================
  const handleDonate = async () => {

    const value =
      parseFloat(amount);

    // amount validation
    if (!value || value <= 0) {

      return alert(
        "Invalid amount"
      );
    }

    // free donation requires description
    if (
      mode === "free" &&
      !notes.trim()
    ) {

      return alert(
        "Please describe the purpose of your donation"
      );
    }

    try {

      setLoading(true);

      const payload = {

        amount: value,

        notes:
          notes.trim() || null
      };

      // targeted donation
      if (
        mode === "targeted" &&
        request
      ) {

        payload.request_id =
          request.id;
      }

      await axios.post(
        "/donations",
        payload
      );

      alert(

        mode === "free"

          ? "Free donation submitted successfully."

          : "Donation sent successfully."
      );

      onSuccess();

    } catch (err) {

      console.error(err);

      alert(
        err?.response?.data?.msg ||
        "Donation failed"
      );

    } finally {

      setLoading(false);
    }
  };

  // =====================
  // UI
  // =====================
  return (
    <Overlay>

      <Modal>

        <h3>

          {mode === "free"

            ? "Make a Free Donation"

            : "Donate to"}

        </h3>

        {/* REQUEST */}
        {mode === "targeted" &&
          request && (
          <p>{request.title}</p>
        )}

        {/* MODE TOGGLE */}
        {request && (

          <ToggleContainer>

            <ToggleButton
              $active={
                mode === "targeted"
              }
              onClick={() =>
                setMode(
                  "targeted"
                )
              }
            >
              Targeted
            </ToggleButton>

            <ToggleButton
              $active={
                mode === "free"
              }
              onClick={() =>
                setMode("free")
              }
            >
              Free Donation
            </ToggleButton>

          </ToggleContainer>
        )}

        {/* AMOUNT */}
        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
        />

        {/* NOTES */}
        <TextArea
          placeholder={
            mode === "free"

              ? "Describe the purpose of this donation (required)"

              : "Optional message or note"
          }

          value={notes}

          onChange={(e) =>
            setNotes(
              e.target.value
            )
          }
        />

        {/* INFO */}
        <Info>

          {mode === "free"

            ? "The admin will allocate this donation to suitable requests."

            : "This donation will be confirmed by the request owner."}

        </Info>

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px"
          }}
        >

          <Button
            content={
              loading
                ? "Processing..."
                : "Confirm"
            }
            handleClick={
              handleDonate
            }
          />

          <Button
            content="Cancel"
            handleClick={onClose}
          />

        </div>

      </Modal>

    </Overlay>
  );
};