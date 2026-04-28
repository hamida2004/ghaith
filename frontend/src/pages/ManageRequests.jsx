import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import axios from "../api/axios";
import { PageContainer } from "../components/PageContainer";
import { colors } from "../style/style";
import { EmptyState } from "../components/EmptyState";
import { RequestCard } from "../components/RequestCard";

// =====================
// STYLES
// =====================
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const Title = styled.h1`
  color: ${colors.main};
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  flex-wrap: wrap;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  flex: 1;
`;

const Select = styled.select`
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const ResetBtn = styled.button`
  padding: 10px 14px;
  background: ${colors.main};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Loader = styled.p`
  text-align: center;
`;

const Error = styled.p`
  text-align: center;
  color: red;
`;

// =====================
// COMPONENT
// =====================
export const ManageRequests = () => {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [donationFilter, setDonationFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  // =====================
  // FETCH USER + REQUESTS
  // =====================
  const fetchData = async () => {
    try {
      setError("");
      setLoading(true);

      const [userRes, reqRes] = await Promise.all([
        axios.get("/users/me"),
        axios.get("/requests")
      ]);

      setUser(userRes.data);

      // normalize Sequelize raw
      const clean = (reqRes.data || []).map(r => r.dataValues || r);
      setRequests(clean);

    } catch (err) {
      console.error(err);
      setError("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isAdmin = !!user?.is_admin;

  // =====================
  // UPDATE STATUS (ADMIN)
  // =====================
  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/requests/${id}/status`, { status });

      // refresh from backend (source of truth)
      const res = await axios.get("/requests");
      const clean = (res.data || []).map(r => r.dataValues || r);
      setRequests(clean);

    } catch (err) {
      console.error(err);
      alert("Failed to update request");
    }
  };

  // =====================
  // FILTER + SORT
  // =====================
  const filtered = useMemo(() => {
    return requests
      .filter(r =>
        (r.title || "").toLowerCase().includes(search.toLowerCase())
      )
      .filter(r => statusFilter === "all" || r.status === statusFilter)
      .filter(r => donationFilter === "all" || r.donation_status === donationFilter)
      .sort((a, b) =>
        sortOrder === "desc"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );
  }, [requests, search, statusFilter, donationFilter, sortOrder]);

  // =====================
  // RESET
  // =====================
  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDonationFilter("all");
    setSortOrder("desc");
  };

  // =====================
  // UI
  // =====================
  return (
    <PageContainer>
      <Header>
        <Title>Manage Requests</Title>
      </Header>

      {/* CONTROLS */}
      <Controls>
        <Input
          placeholder="Search requests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="refused">Refused</option>
        </Select>

        <Select
          value={donationFilter}
          onChange={(e) => setDonationFilter(e.target.value)}
        >
          <option value="all">All Donation</option>
          <option value="satisfied">Satisfied</option>
          <option value="partially">Partially</option>
          <option value="not_satisfied">Not Satisfied</option>
        </Select>

        <Select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </Select>

        <ResetBtn onClick={resetFilters}>
          Reset
        </ResetBtn>
      </Controls>

      {/* CONTENT */}
      {loading ? (
        <Loader>Loading...</Loader>
      ) : error ? (
        <Error>{error}</Error>
      ) : filtered.length > 0 ? (
        <List>
          {filtered.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              isAdmin={isAdmin}                 // 🔥 from user
              onAccept={() => updateStatus(r.id, "accepted")}
              onRefuse={() => updateStatus(r.id, "refused")}
            />
          ))}
        </List>
      ) : (
        <EmptyState message="No requests available" />
      )}
    </PageContainer>
  );
};