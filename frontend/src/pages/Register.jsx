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
`;

const Select = styled.select`
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #ccc;
`;

const Error = styled.p`
  color: red;
  text-align: center;
`;

export const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone:"",
    password: "",
    type: "person",
    role: "donator" // ✅ NEW
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.email || !form.password) {
        setError("All fields required");
        return;
      }

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
        <Image src={image} alt="" />
      </Half>

      <Half direction="left">
        <FormContainer>

          <Title>Welcome</Title>
          <SubTitle>Create account</SubTitle>

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
            label="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {/* TYPE */}
          <Select
            value={form.type}
            onChange={(e) => {
              const type = e.target.value;

              setForm({
                ...form,
                type,
                role: type === "organization" ? "seeker" : form.role
              });
            }}
          >
            <option value="person">Person</option>
            <option value="organization">Organization</option>
          </Select>

          {/* ROLE */}
          <Select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            disabled={form.type === "organization"}
          >
            <option value="donator">Donator</option>
            <option value="seeker">Seeker</option>
          </Select>

          {error && <Error>{error}</Error>}

          <Button
            handleClick={handleSubmit}
            content={loading ? "Registering..." : "Register"}
          />

        </FormContainer>
      </Half>
    </div>
  );
};