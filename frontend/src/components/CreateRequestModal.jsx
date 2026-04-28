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
  background: ${(p) => p.bg || colors.main};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const Error = styled.p`
  color: red;
  font-size: 13px;
  margin-bottom: 10px;
`;

// =====================
// COMPONENT
// =====================
export const CreateRequestModal = ({ onClose, onCreate, categories = [] }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    target_amount: "",
    category_id: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // =====================
  // VALIDATION + SUBMIT
  // =====================
  // const handleSubmit = async () => {
  //   setError("");

  //   if (!form.title || !form.description || !form.category_id) {
  //     return setError("Please fill all required fields");
  //   }

  //   const amount = Number(form.target_amount);

  //   if (!amount || amount <= 0) {
  //     return setError("Invalid target amount");
  //   }

  //   try {
  //     setLoading(true);

  //     await onCreate({
  //       ...form,
  //       category_id: Number(form.category_id),
  //       target_amount: amount
  //     });

  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to create request");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
  setError("");

  if (!form.title || !form.description || !form.category_id) {
    return setError("Please fill all required fields");
  }

  const amount = Number(form.target_amount);
  if (!amount || amount <= 0) {
    return setError("Invalid target amount");
  }

  // 🔥 derive type from category
  const selectedCategory = categories.find(
    (c) => c.id === Number(form.category_id)
  );

  const type =
    selectedCategory?.name?.toLowerCase() === "money"
      ? "money"
      : "things";

  try {
    setLoading(true);

    await onCreate({
      ...form,
      category_id: Number(form.category_id),
      target_amount: amount,
      type // ✅ now always sent
    });

  } catch (err) {
    console.error(err);
    setError("Failed to create request");
  } finally {
    setLoading(false);
  }
};

  return (
    <Overlay>
      <Modal>
        <h3>Create Request</h3>

        {error && <Error>{error}</Error>}

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
          value={form.category_id}
          onChange={(e) => handleChange("category_id", e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>

        <Button bg={colors.red} onClick={onClose}>
          Cancel
        </Button>
      </Modal>
    </Overlay>
  );
};