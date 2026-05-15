import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import axios from "../api/axios";
import { PageContainer } from "../components/PageContainer";
import { colors } from "../style/style";
import { EmptyState } from "../components/EmptyState";
import { RequestCard } from "../components/RequestCard";
import { useNavigate } from "react-router-dom";

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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
const [urgencyOrder, setUrgencyOrder] = useState("desc"); 
// desc = highest urgency first
const navigate = useNavigate()
  // =====================
  // FETCH DATA
  // =====================
const fetchData = async () => {
  try {
    setLoading(true);

    // =====================
    // 1. GET USER FIRST
    // =====================
    const userRes = await axios.get("/users/me");
    const userData = userRes.data;

    setUser(userData);

    const isAdmin = !!userData.is_admin;
    const isDonator = userData.role === "donator";

    // =====================
    // 2. CHOOSE ENDPOINT
    // =====================
    let endpoint = "/requests"; // default (donator)

    if (isAdmin) {
      endpoint = "/requests/all";
    }

    // =====================
    // 3. FETCH REQUESTS
    // =====================
    const reqRes = await axios.get(endpoint);

    const clean = (reqRes.data || []).map(r => r.dataValues || r);
    setRequests(clean);

    console.log("USER:", userData);
    console.log("ENDPOINT:", endpoint);
    console.log("REQUESTS:", reqRes.data);

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
    fetchData();
  }, []);

  const isAdmin = !!user?.is_admin;
  const isDonator = user?.role === "donator";

  // =====================
  // ADMIN ACTION
  // =====================
  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/requests/${id}/status`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // =====================
  // DONATION ACTION
  // =====================
  const handleDonate = async (request) => {
    try {
      const amount = prompt("Enter donation amount:");
      if (!amount || Number(amount) <= 0) return;

      await axios.post("/donations", {
        request_id: request.id,
        amount
      });

      alert("Donation sent (pending admin approval)");
    } catch (err) {
      console.error(err);
      alert("Donation failed");
    }
  };

  // =====================
  // FILTER
  // =====================
const filtered = useMemo(() => {
  return requests
    .filter(r =>
      (r.title || "").toLowerCase().includes(search.toLowerCase())
    )
    .filter(r =>
      statusFilter === "all" || r.status === statusFilter
    )
    // 🔥 SORT BY URGENCY
    .sort((a, b) => {
      if (urgencyOrder === "desc") {
        return (b.urgency || 0) - (a.urgency || 0); // high → low
      } else {
        return (a.urgency || 0) - (b.urgency || 0); // low → high
      }
    });

}, [requests, search, statusFilter, urgencyOrder]);
  // =====================
  // UI
  // =====================
  return (
    <PageContainer>
      <Header>
        <Title>Requests</Title>
      </Header>

      <Controls>
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="accepted">Accepted</option>
          <option value="pending">Pending</option>
        </Select>
<Select
  value={urgencyOrder}
  onChange={(e) => setUrgencyOrder(e.target.value)}
>
  <option value="desc">Urgency: High → Low</option>
  <option value="asc">Urgency: Low → High</option>
</Select>
        <ResetBtn onClick={() => {
          setSearch("");
          setStatusFilter("all");
        }}>
          Reset
        </ResetBtn>
      </Controls>

      {loading ? (
        <Loader>Loading...</Loader>
      ) : filtered.length > 0 ? (
        <List>
          {filtered.map(r => (
            <RequestCard
              key={r.id}
              request={r}

              isAdmin={isAdmin}
              isDonator={isDonator}

              onAccept={() => updateStatus(r.id, "accepted")}
              onRefuse={() => updateStatus(r.id, "refused")}

              onDonate={handleDonate}
            />
          ))}
        </List>
      ) : (
        <EmptyState message="No requests available" />
      )}
    </PageContainer>
  );
};