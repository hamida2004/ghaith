import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "../api/axios";
import { PageContainer } from "../components/PageContainer";
import { colors } from "../style/style";
import { Button } from "../components/Button";

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
  background: ${colors.main}20;
  margin-bottom: 10px;
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
  color: ${colors.main};
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #ddd;
`;

const Msg = styled.p`
  margin-top: 10px;
  color: ${(p) => (p.error ? "red" : "green")};
`;

// =====================
// COMPONENT
// =====================
export const Profile = () => {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get("/users/me").then(res => setUser(res.data));
  }, []);

  const handleSave = async () => {
    try {
      await axios.patch("/users/me", user);
      setMsg("Profile updated");
      setError(false);
    } catch {
      setMsg("Update failed");
      setError(true);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMsg("Select file");
      setError(true);
      return;
    }

    try {
      const data = new FormData();
      data.append("document", file);
      data.append(
        "type",
        user.type === "organization" ? "org_doc" : "id_card"
      );

      await axios.post("/users/upload", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMsg("Uploaded. Waiting for approval.");
      setError(false);

    } catch {
      setMsg("Upload failed");
      setError(true);
    }
  };

  if (!user) return <PageContainer>Loading...</PageContainer>;

  return (
    <PageContainer>
      <Container>

        <Avatar />
        <h2>{user.name}</h2>
        <p>{user.type}</p>

        <Form>
          <Field>
            <Label>Name</Label>
            <Input value={user.name || ""} onChange={e => setUser({ ...user, name: e.target.value })} />
          </Field>

          <Field>
            <Label>Email</Label>
            <Input value={user.email || ""} onChange={e => setUser({ ...user, email: e.target.value })} />
          </Field>
        </Form>

        <Button handleClick={handleSave} content="Save" />

        {/* DOCUMENT */}
        {user.status !== "active" && (
          <div style={{ marginTop: 30 }}>
            <h3>Activate Account</h3>

            <input type="file" onChange={e => setFile(e.target.files[0])} />

            <Button handleClick={handleUpload} content="Upload Document" />
          </div>
        )}

        {msg && <Msg error={error}>{msg}</Msg>}

      </Container>
    </PageContainer>
  );
};