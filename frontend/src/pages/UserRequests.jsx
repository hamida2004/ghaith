import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "../api/axios";
import { PageContainer } from "../components/PageContainer";
import { colors } from "../style/style";
import { EmptyState } from "../components/EmptyState";
import { CreateRequestModal } from "../components/CreateRequestModal";

// =====================
// STYLES
// =====================
const Header = styled.div`
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
`;

const Button = styled.button`
  padding: 10px;
  background: ${colors.main};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const Loader = styled.p`
  text-align: center;
`;

// =====================
// COMPONENT
// =====================
export const UserRequests = () => {
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);

  // =====================
  // FETCH DATA
  // =====================
  const fetchData = async () => {
    try {
      const [reqRes, catRes] = await Promise.all([
        axios.get("/requests/me"),
        axios.get("/categories")
      ]);

      setRequests(reqRes.data);
      setCategories(catRes.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================
  // CREATE REQUEST
  // =====================
  const createRequest = async (form) => {
    try {
      if (!form.title || !form.description || !form.category_id) {
        return alert("Please fill all fields");
      }

      await axios.post("/requests", form);

      setOpenModal(false);

      // refresh data
      const res = await axios.get("/requests/me");
      setRequests(res.data);

    } catch (err) {
      console.error(err);
      alert("Failed to create request");
    }
  };

  return (
    <PageContainer>

      {/* HEADER */}
      <Header>
        <Title>My Requests</Title>

        <Button onClick={() => setOpenModal(true)}>
          + Add Request
        </Button>
      </Header>

      {/* LIST */}
      {loading ? (
        <Loader>Loading...</Loader>
      ) : requests.length > 0 ? (
        <List>
          {requests.map(r => (
            <Card key={r.id}>
              <h3>{r.title}</h3>
              <p>{r.description}</p>
              <p><strong>Status:</strong> {r.status}</p>
              <p><strong>Collected:</strong> {r.collected_amount}</p>
              <p><strong>Target:</strong> {r.target_amount}</p>
            </Card>
          ))}
        </List>
      ) : (
        <EmptyState message="No requests available" />
      )}

      {/* MODAL */}
      {openModal && (
        <CreateRequestModal
          onClose={() => setOpenModal(false)}
          onCreate={createRequest}
          categories={categories}
        />
      )}

    </PageContainer>
  );
};