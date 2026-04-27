import React, { useState } from "react";
import styled from "styled-components";
import { colors } from "../style/style";

// =====================
// STYLES
// =====================
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 350px;
`;

const Input = styled.input`
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const Select = styled.select`
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background: ${colors.main};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

// =====================
// COMPONENT
// =====================
export const CreateRequestModal = ({ onClose, onCreate, categories }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    target_amount: "",
    type: "money",
    category_id: ""
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Overlay>
      <Modal>
        <h3>Create Request</h3>

        <Input
          placeholder="Title"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />

        <Input
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        <Input
          type="number"
          placeholder="Target amount"
          value={form.target_amount}
          onChange={(e) => handleChange("target_amount", e.target.value)}
        />

        <Select
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
        >
          <option value="money">Money</option>
          <option value="things">Things</option>
        </Select>

        {/* ✅ categories from backend */}
        <Select
          value={form.category_id}
          onChange={(e) => handleChange("category_id", e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Button onClick={() => onCreate(form)}>
          Create
        </Button>

        <Button
          style={{ background: colors.red }}
          onClick={onClose}
        >
          Cancel
        </Button>
      </Modal>
    </Overlay>
  );
};