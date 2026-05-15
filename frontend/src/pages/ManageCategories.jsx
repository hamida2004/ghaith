import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "../api/axios";
import { PageContainer } from "../components/PageContainer";
import { colors } from "../style/style";
import { useNavigate } from "react-router-dom";

// =====================
// STYLES
// =====================
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
`;

const Title = styled.h1`
  color: ${colors.main};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Card = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const TextArea = styled.textarea`
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  padding: 8px 12px;
  background: ${(p) => p.bg || colors.main};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const Loader = styled.p`
  text-align: center;
`;

const Error = styled.p`
  color: red;
`;

// =====================
// COMPONENT
// =====================
export const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()
  // =====================
  // FETCH
  // =====================
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);

    // ✅ HANDLE 403
    if (err.response?.status === 403) {
      navigate("/not-found"); // or "/403" if you have a dedicated page
      return;
    }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =====================
  // VALIDATION
  // =====================
  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.description.trim()) return "Description is required";
    return null;
  };

  // =====================
  // CREATE
  // =====================
  const createCategory = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError("");

      const res = await axios.post("/categories", form);

      setCategories((prev) => [...prev, res.data]);

      setForm({ name: "", description: "" });

    } catch (err) {
      console.error(err);
      setError("Failed to create category");
    }
  };

  // =====================
  // UPDATE
  // =====================
  const updateCategory = async (id, data) => {
    if (!data.name.trim() || !data.description.trim()) {
      alert("All fields required");
      return;
    }

    try {
      await axios.patch(`/categories/${id}`, data);

      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, ...data } : c
        )
      );

    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  // =====================
  // DELETE
  // =====================
  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await axios.delete(`/categories/${id}`);

      setCategories((prev) =>
        prev.filter((c) => c.id !== id)
      );

    } catch (err) {
      console.error(err);

      alert("Delete failed");
    }
  };

  // =====================
  // UI
  // =====================
  return (
    <PageContainer>

      <Header>
        <Title>Manage Categories</Title>
      </Header>

      {/* CREATE FORM */}
      <Form>
        <Input
          placeholder="Category name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <TextArea
          placeholder="Category description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        {error && <Error>{error}</Error>}

        <Button onClick={createCategory}>
          Add Category
        </Button>
      </Form>

      {/* LIST */}
      {loading ? (
        <Loader>Loading...</Loader>
      ) : categories.length > 0 ? (
        <List>
          {categories.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
            />
          ))}
        </List>
      ) : (
        <p>No categories found</p>
      )}

    </PageContainer>
  );
};

// =====================
// CATEGORY ITEM
// =====================
const CategoryItem = ({ category, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: category.name,
    description: category.description || ""
  });

  const save = () => {
    onUpdate(category.id, form);
    setEditing(false);
  };

  return (
    <Card>
      {editing ? (
        <>
          <Input
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <TextArea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </>
      ) : (
        <>
          <strong>{category.name}</strong>
          <p>{category.description}</p>
        </>
      )}

      <Actions>
        {editing ? (
          <Button onClick={save}>Save</Button>
        ) : (
          <Button onClick={() => setEditing(true)}>Edit</Button>
        )}

        <Button
          bg={colors.red}
          onClick={() => onDelete(category.id)}
        >
          Delete
        </Button>
      </Actions>
    </Card>
  );
};