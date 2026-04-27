import React, { useState } from "react";
import styled from "styled-components";
import { PageContainer } from "../components/PageContainer";
import { colors } from "../style/style";

// =====================
// STYLES
// =====================
const Container = styled.div`
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #ccc;
  margin-bottom: 10px;
`;

const Name = styled.h2`
  margin: 5px 0;
`;

const Role = styled.p`
  color: gray;
  margin-bottom: 30px;
`;

const Form = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 600px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 5px;
  color: ${colors.main};
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 20px;
  border: 1px solid #ddd;
  outline: none;
`;

const Button = styled.button`
  margin-top: 30px;
  padding: 12px 40px;
  background: ${colors.main};
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
`;

// =====================
// MOCK USER (from DB structure)
// =====================
const mockUser = {
  id: 1,
  name: "Benali Kadour",
  email: "benali@mail.com",
  type: "person",
  phone: "+2130553454437",
  address: "Relizane",
};

// =====================
// COMPONENT
// =====================
export const Profile = () => {
  const [user, setUser] = useState(mockUser);

  const handleChange = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  const handleSave = () => {
    console.log("Updated user:", user);
    alert("Profile updated");
  };

  return (
    <PageContainer>
      <Container>

        {/* AVATAR */}
        <Avatar />

        <Name>{user.name}</Name>
        <Role> {user.type}</Role>

        {/* FORM */}
        <Form>

          <Field>
            <Label>Name</Label>
            <Input
              value={user.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </Field>

          <Field>
            <Label>Email</Label>
            <Input
              value={user.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </Field>

          <Field>
            <Label>Phone</Label>
            <Input
              value={user.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </Field>

          <Field>
            <Label>Address</Label>
            <Input
              value={user.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </Field>

          <Field>
            <Label>Type</Label>
            <Input value={user.type} disabled />
          </Field>

        </Form>

        <Button onClick={handleSave}>
          Save
        </Button>

      </Container>
    </PageContainer>
  );
};