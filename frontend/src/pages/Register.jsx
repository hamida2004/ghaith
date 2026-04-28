import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Half } from "../components/Half";
import styled from "styled-components";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { colors } from "../style/style";
import image from "../assets/images/register.svg";
import { CustomLink } from "../components/CustomLink";

const Image = styled.img`
  min-width: 200px;
  width: 50%;
`;

const FormContainer = styled.div`
  width: 340px;
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

const Select = styled.select`
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #ccc;
  outline: none;

  &:focus {
    border-color: ${colors.main};
  }
`;

const Error = styled.p`
  color: red;
  font-size: 13px;
  text-align: center;
`;

export const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    type: "person"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      await axios.post("/auth/register", form);

      alert("Registered. Please login and upload your document.");
      navigate("/login");

    } catch (err) {
      setError(err?.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      <Half direction="right" bgc={colors.main}>
        <Image src={image} alt="illustration" />

        <div style={{
          display:'flex', gap:8,
          position:'absolute', bottom:40, right:40,alignItems:'center'
        }}>
          <p>Already have an account?</p>
          <CustomLink content="Sign In" color={colors.white} to="/login" />
        </div>
      </Half>

      <Half direction="left">
        <FormContainer>

          <Title>Welcome!</Title>
          <SubTitle>Create your account</SubTitle>

          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="person">Person</option>
            <option value="organization">Organization</option>
          </Select>

          {error && <Error>{error}</Error>}

          <Button
            handleClick={handleSubmit}
            content={loading ? "Registering..." : "Register"}
            disabled={loading}
          />

        </FormContainer>
      </Half>
    </div>
  );
};