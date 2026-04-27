import React, { useState } from "react";
import styled from "styled-components";
import axios from "../api/axios";
import { Half } from "../components/Half";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { colors } from "../style/style";
import image from "../assets/images/login.svg";

// =====================
// STYLES
// =====================
const Image = styled.img`
  width: 60%;
  min-width: 220px;
`;

const FormContainer = styled.div`
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Title = styled.h1`
  text-align: center;
  color: ${colors.main};
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  font-size: 14px;
`;

const Error = styled.p`
  color: red;
  font-size: 13px;
  text-align: center;
`;

const Success = styled.p`
  color: green;
  font-size: 13px;
  text-align: center;
`;

// =====================
// COMPONENT
// =====================
export const ResetPwd = () => {
  const [step, setStep] = useState(1); // 1 = send code, 2 = reset
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    code: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================
  // SEND CODE
  // =====================
  const handleSendCode = async () => {
    try {
      setLoading(true);
      setError("");

      await axios.post("/auth/request-reset", {
        email: form.email
      });

      setStep(2);
      setSuccess("Code sent to your email");

    } catch (err) {
      setError(err?.response?.data?.msg || "Error sending code");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // RESET PASSWORD
  // =====================
  const handleReset = async () => {
    try {
      setLoading(true);
      setError("");

      await axios.post("/auth/reset-password", {
        email: form.email,
        code: form.code,
        password: form.password
      });

      setSuccess("Password updated successfully");

    } catch (err) {
      setError(err?.response?.data?.msg || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT */}
      <Half direction="left" bgc={colors.main}>
        <Image src={image} alt="reset" />
      </Half>

      {/* RIGHT */}
      <Half direction="right">
        <FormContainer>

          <Title>Reset Password</Title>

          <Subtitle>
            {step === 1
              ? "Enter your email to receive a code"
              : "Enter the code and your new password"}
          </Subtitle>

          {/* EMAIL */}
          <Input
            label="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          {/* STEP 2 ONLY */}
          {step === 2 && (
            <>
              <Input
                label="6-digit Code"
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value })
                }
              />

              <Input
                label="New Password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </>
          )}

          {/* FEEDBACK */}
          {error && <Error>{error}</Error>}
          {success && <Success>{success}</Success>}

          {/* BUTTON */}
          <Button
            content={step === 1 ? "Send Code" : "Reset Password"}
            handleClick={step === 1 ? handleSendCode : handleReset}
            disabled={
              loading ||
              !form.email ||
              (step === 2 && (!form.code || !form.password))
            }
          />

        </FormContainer>
      </Half>

    </div>
  );
};