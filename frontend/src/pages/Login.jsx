import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import { Half } from "../components/Half";
import image from "../assets/images/login.svg";
import styled from "styled-components";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { colors } from "../style/style";
import { CustomLink } from "../components/CustomLink";



const Image = styled.img`
  min-width: 200px;
  width: 50%;
`;

const FormContainer = styled.div`
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h1`
  text-align: center;
  color: ${colors.main};
`;

const SubTitle = styled.h2`
  text-align: center;
  color: ${colors.black};
`;

const Error = styled.p`
  color: red;
  text-align: center;
  font-size: 14px;
`;

// =====================
// COMPONENT
// =====================
export const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // =====================
  // SUBMIT
  // =====================
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post("/auth/login", form);

      const token = res.data.token;

      login(token);

      // =====================
      // DECODE TOKEN (ROLE)
      // =====================
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.is_admin) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }

    } catch (err) {
      setError(err?.response?.data?.msg || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // ENTER KEY SUPPORT
  // =====================
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT */}
      <Half direction="left" bgc={colors.main}>
        <Image src={image} alt="illustration" />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            position: "absolute",
            bottom: 40,
            left: 40
          }}
        >
          <p>You don't have an account yet?</p>
          <CustomLink content="Sign up" color={colors.white} to="/register" />
        </div>
      </Half>

      {/* RIGHT */}
      <Half direction="right">
        <FormContainer>

          <Title>Welcome Back!</Title>
          <SubTitle>Sign in to your account</SubTitle>

          <Input
            label="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            onKeyDown={handleKeyPress}
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            onKeyDown={handleKeyPress}
          />

          {error && <Error>{error}</Error>}

          <Button
            handleClick={handleSubmit}
            content={loading ? "Logging in..." : "Login"}
            disabled={loading || !form.email || !form.password}
          />

        </FormContainer>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          <p>Forgot your password?</p>
          <CustomLink
            content="Reset it here"
            color={colors.red}
            to="/resetpassword"
          />
        </div>
      </Half>

    </div>
  );
};