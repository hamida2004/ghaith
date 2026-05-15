import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../style/style";
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
  width: 420px;
`;

const Input = styled.input`
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
`;

const Select = styled.select`
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
`;

const Error = styled.p`
  color: red;
  font-size: 13px;
`;

export const CreateRequestModal = ({ onClose, onCreate, categories }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    target_amount: "",
    category_id: "",
    address: "",
    occupation: "",
    urgency: 1,
    phone: "" // ✅ REQUIRED FIELD FIX
  });

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setError("");

    if (
      !form.title ||
      !form.description ||
      !form.category_id ||
      !form.address ||
      !form.occupation ||
      !form.target_amount ||
      !form.phone // ✅ FIX
    ) {
      return setError("All fields are required");
    }

    if (!file) return setError("Document is required");

    try {
      const selectedCategory = categories.find(
        c => c.id === Number(form.category_id)
      );

      const type =
        selectedCategory?.name?.toLowerCase() === "money"
          ? "money"
          : "things";

      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      data.append("type", type);
      data.append("document", file);

      await onCreate(data);

    } catch (err) {
      console.error(err);
      setError("Failed to create request");
    }
  };

  return (
    <Overlay>
      <Modal>
        <h3>Create Request</h3>

        {error && <Error>{error}</Error>}

        <Input placeholder="Title" onChange={e => handleChange("title", e.target.value)} />
        <Input placeholder="Description" onChange={e => handleChange("description", e.target.value)} />
        <Input type="number" placeholder="Target amount" onChange={e => handleChange("target_amount", e.target.value)} />
        <Input placeholder="Phone" onChange={e => handleChange("phone", e.target.value)} /> {/* ✅ FIX */}
        <Input placeholder="Address" onChange={e => handleChange("address", e.target.value)} />
        <Input placeholder="Occupation" onChange={e => handleChange("occupation", e.target.value)} />

        <Input
          type="number"
          min={1}
          max={5}
          placeholder="Urgency (1-5)"
          onChange={e => handleChange("urgency", e.target.value)}
        />

        <Select onChange={e => handleChange("category_id", e.target.value)}>
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <input type="file" onChange={e => setFile(e.target.files[0])} />

        <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
          <Button handleClick={handleSubmit} content="Create" />
          <Button color={colors.red} handleClick={onClose} content="Cancel" />
        </div>
      </Modal>
    </Overlay>
  );
};