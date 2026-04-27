import React, { useContext, useState } from 'react'
import {  useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import { Half } from '../components/Half';
import image from '../assets/images/login.svg';
import styled from 'styled-components';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../style/style';
import { CustomLink } from '../components/CustomLink';

// =====================
// STYLES (OUTSIDE COMPONENT)
// =====================
const Image = styled.img`
  min-width: 200px;
  width:50%;
`;

const FormContainer = styled.div`
  width: 300px;
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


// =====================
// COMPONENT
// =====================
export const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/auth/login", form);
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT */}
      <Half direction="left" bgc={colors.main} >
        <Image src={image} alt="illustration" />
          <div
        style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          gap:8,
          position:'absolute',
          bottom:40,
          left:40
        }}
        >
          <p>
            You Don't have an account yet ?
          </p>
        <CustomLink content={"Sign up"} color={colors.white} to={"/register"}/>
        </div>
      </Half>

      {/* RIGHT */}
      <Half direction="right">
        <FormContainer>

          <Title>Welcome Back !</Title>
          <SubTitle>Sign In To Your Account </SubTitle>

          <Input
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            label="Password"
            type="password" // ✅ FIXED
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Button
            onClick={handleSubmit}
            content={"Login"}
            disabled={!form.email || !form.password}
          >
           
          </Button>

        </FormContainer>
           <div
        style={{
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          gap:8
        }}
        >
          <p>
            Forgot your password ?
          </p>
        <CustomLink content={"Reset it here"} color={colors.red} to={"/resetpassword"}/>
        </div>
      </Half>

    </div>
  );
};