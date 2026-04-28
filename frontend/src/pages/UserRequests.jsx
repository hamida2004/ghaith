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
  padding: 8px 12px;
  background: ${colors.main};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const Loader = styled.p`
  text-align: center;
`;

const DonationBox = styled.div`
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 5px;
`;

// =====================
// COMPONENT
// =====================
export const UserRequests = () => {
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  // =====================
  // FETCH DATA
  // =====================
const fetchData = async () => {
  setLoading(true);

  try {
    // =====================
    // REQUESTS
    // =====================
    const reqRes = await axios.get("/requests/me");
    setRequests(reqRes.data || []);

    // =====================
    // CATEGORIES (independent)
    // =====================
    try {
      const catRes = await axios.get("/categories");

      const normalizedCategories = (catRes.data || []).map(
        (c) => c.dataValues || c
      );

      setCategories(normalizedCategories);
      console.log("CATEGORIES:", normalizedCategories);

    } catch (err) {
      console.error("Categories error:", err);
    }

    // =====================
    // DONATIONS (may fail)
    // =====================
    try {
      const donationRes = await axios.get("/donations/pending");
      setPendingDonations(donationRes.data || []);
    } catch (err) {
      console.error("Donations error:", err);
      setPendingDonations([]); // fallback
    }

  } catch (err) {
    console.error("Requests error:", err);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchData();
  }, []);

  // ✅ correct logging after state update
  useEffect(() => {
    console.log("UPDATED categories:", categories);
  }, [categories]);

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

      // refresh requests
      const res = await axios.get("/requests/me");
      setRequests(res.data || []);

    } catch (err) {
      console.error(err);
      alert("Failed to create request");
    }
  };

  // =====================
  // CONFIRM / REJECT DONATION
  // =====================
  const handleDonationStatus = async (id, status) => {
    try {
      await axios.patch(`/donations/${id}/status`, { status });

      // remove locally
      setPendingDonations((prev) =>
        prev.filter((d) => d.id !== id)
      );

      // refresh requests (important)
      const res = await axios.get("/requests/me");
      setRequests(res.data || []);

    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  // =====================
  // UI
  // =====================
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
          {requests.map((r) => {
            const donationsForRequest = pendingDonations.filter(
              (d) => d.request_id === r.id
            );

            return (
              <Card key={r.id}>
                <h3>{r.title}</h3>
                <p>{r.description}</p>
                <p><strong>Status:</strong> {r.status}</p>
                <p><strong>Collected:</strong> {r.collected_amount}</p>
                <p><strong>Target:</strong> {r.target_amount}</p>

                {/* =====================
                    PENDING DONATIONS
                ===================== */}
                {donationsForRequest.length > 0 && (
                  <div style={{ marginTop: 15 }}>
                    <strong>Pending Donations:</strong>

                    {donationsForRequest.map((d) => (
                      <DonationBox key={d.id}>
                        <p><strong>Amount:</strong> {d.amount}</p>
                        <p><strong>From:</strong> {d.User?.name}</p>

                        <Actions>
                          <Button
                            onClick={() =>
                              handleDonationStatus(d.id, "confirmed")
                            }
                            style={{ background: colors.green }}
                          >
                            Confirm
                          </Button>

                          <Button
                            onClick={() =>
                              handleDonationStatus(d.id, "rejected")
                            }
                            style={{ background: colors.red }}
                          >
                            Reject
                          </Button>
                        </Actions>
                      </DonationBox>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </List>
      ) : (
        <EmptyState message="No requests available" />
      )}

      {/* MODAL */}
      {openModal && (
        <CreateRequestModal
          onClose={() => setOpenModal(false)}
          onCreate={createRequest}
          categories={categories} // ✅ now always correct
        />
      )}

    </PageContainer>
  );
};