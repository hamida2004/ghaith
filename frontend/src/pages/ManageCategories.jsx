import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "../api/axios";
import { PageContainer } from "../components/PageContainer";
import { colors } from "../style/style";

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
  justify-content: space-between;
  align-items: center;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  width: 200px;
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
  gap: 10px;
  margin-bottom: 20px;
`;

const Loader = styled.p`
  text-align: center;
`;

// =====================
// COMPONENT
// =====================
export const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  // =====================
  // FETCH
  // =====================
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =====================
  // CREATE
  // =====================
  const createCategory = async () => {
    if (!newName.trim()) return;

    try {
      const res = await axios.post("/categories", { name: newName });

      setCategories((prev) => [...prev, res.data]);
      setNewName("");

    } catch (err) {
      console.error(err);
      alert("Failed to create category");
    }
  };

  // =====================
  // UPDATE
  // =====================
  const updateCategory = async (id, name) => {
    try {
      await axios.patch(`/categories/${id}`, { name });

      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name } : c))
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

      setCategories((prev) => prev.filter((c) => c.id !== id));

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

      {/* CREATE */}
      <Form>
        <Input
          placeholder="New category..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        <Button onClick={createCategory}>
          Add
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
// CATEGORY ITEM COMPONENT
// =====================
const CategoryItem = ({ category, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);

  const save = () => {
    if (!name.trim()) return;
    onUpdate(category.id, name);
    setEditing(false);
  };

  return (
    <Card>
      {editing ? (
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      ) : (
        <span>{category.name}</span>
      )}

      <Actions>
        {editing ? (
          <Button onClick={save}>Save</Button>
        ) : (
          <Button onClick={() => setEditing(true)}>Edit</Button>
        )}

        <Button bg={colors.red} onClick={() => onDelete(category.id)}>
          Delete
        </Button>
      </Actions>
    </Card>
  );
};