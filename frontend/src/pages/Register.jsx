import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { Half } from '../components/Half';
import styled from 'styled-components';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../style/style';
import image from '../assets/images/register.svg';
import { CustomLink } from '../components/CustomLink';

// =====================
// STYLES
// =====================
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
  color: ${colors.main}
`;
const SubTitle = styled.h2`
  text-align: center;
  color:${colors.black}
`;

const Select = styled.select`
  padding: 12px;
  border-radius: 8px;

co
  border: 2px solid #ccc;
  outline: none;

  &:focus {
    border-color: ${colors.main};
  }
`;

const FileInput = styled.input`
  border: none;
`;

// =====================
// COMPONENT
// =====================
export const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    type: "person"
  });

  const [file, setFile] = useState(null);

  const handleSubmit = async () => {
    try {
      const data = new FormData();

      data.append("name", form.name);
      data.append("email", form.email);
      data.append("password", form.password);
      data.append("type", form.type);

      if (file) {
        data.append("document", file);
      }

      await axios.post("/auth/register", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Registered successfully. Waiting for admin approval.");
      navigate("/");

    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT */}
      <Half direction="right" bgc={colors.main}>
        <Image src={image} alt="illustration" />
         <div

        style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          gap:8,
          position:'absolute',
          bottom:40,
          right:40
        }}
        >
          <p>
            You Alreay Have An Account ?
          </p>
        <CustomLink content={"Sign In"} color={colors.white} to={"/"}/>
        </div>
      </Half>

      {/* RIGHT */}
      <Half direction="left">
        <FormContainer>

          <Title>Welcome !</Title>
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

          {/* USER TYPE */}
          <Select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="person">Person</option>
            <option value="organization">Organization</option>
          </Select>

          {/* FILE UPLOAD */}
          <FileInput
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <Button
            onClick={handleSubmit}
            content={"Register"}
            disabled={!form.name || !form.email || !form.password}
          />

        </FormContainer>
       
      </Half>

    </div>
  );
};