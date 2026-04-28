import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { colors } from "../style/style";
import { RequestCard } from "../components/DonationCard";
import { DonationModal } from "../components/DonationModal";
import { PageContainer } from "../components/PageContainer";
import { Button } from "../components/Button";
import noData from "../assets/images/noData.svg";
import axios from "../api/axios";
import ai from "../api/ai";

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

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ResetBtn = styled.button`
  padding: 10px 14px;
  background: ${colors.main};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const Banner = styled.div`
  background: #fff3cd;
  color: #856404;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
`;

const EmptyImage = styled.img`
  width: 220px;
  opacity: 0.8;
`;

const EmptyText = styled.h2`
  margin-top: 20px;
  color: ${colors.black};
`;

// =====================
// COMPONENT
// =====================
export const HomePage = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("desc");

  const [selectedRequest, setSelectedRequest] = useState(null);

  // =====================
  // FETCH DATA
  // =====================
  const fetchData = async () => {
    try {
      const userRes = await axios.get("/users/me");
      const userData = userRes.data;
      setUser(userData);

      const userId = userData.id;

      const [reqRes, aiRes, catRes] = await Promise.all([
        axios.get("/requests"),
        ai.get(`/recommend/${userId}`),
        axios.get("/categories")
      ]);

      const allRequests = reqRes.data || [];
      const aiRequests = aiRes.data.recommendations || [];

      const normalizedCategories = (catRes.data || []).map(
        (c) => c.dataValues || c
      );
      setCategories(normalizedCategories);

      // =====================
      // MAP REQUESTS
      // =====================
      const requestMap = {};
      allRequests.forEach((r) => {
        requestMap[r.id] = r;
      });

      const fullAI = aiRequests.map((r) =>
        requestMap[r.id] ? requestMap[r.id] : r
      );

      // =====================
      // 🔥 FILTER RULES
      // =====================
      const isValid = (r) =>
        r.status === "accepted" &&
        r.donation_status !== "satisfied" &&
        Number(r.seeker_id) !== Number(userId);

      const cleanRecommended = fullAI.filter(isValid);
      const cleanRequests = allRequests.filter(isValid);

      // =====================
      // MERGE (recommended first)
      // =====================
      const merged = [
        ...cleanRecommended,
        ...cleanRequests.filter(
          (r) => !cleanRecommended.some((rec) => rec.id === r.id)
        )
      ];

      setRecommended(cleanRecommended);
      setRequests(merged);

    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================
  // FILTER UI
  // =====================
  const filtered = useMemo(() => {
    return requests
      .filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase())
      )
      .filter((r) =>
        category === "all"
          ? true
          : r.category_id === Number(category)
      )
      .filter((r) =>
        status === "all"
          ? true
          : r.donation_status === status
      )
      .sort((a, b) =>
        sort === "desc"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      );
  }, [requests, search, category, status, sort]);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setStatus("all");
    setSort("desc");
  };

  // =====================
  // UI
  // =====================
  return (
    <PageContainer>

      {/* ACCOUNT STATUS */}
      {user && user.status !== "active" && (
        <Banner>
          <span>
            Your account is <strong>{user.status}</strong>.
          </span>

          <Button
            handleClick={() => navigate(`/profile`)}
            content="Activate"
          />
        </Banner>
      )}

      {/* HEADER */}
      <Header>
        <Title>Available Requests</Title>

        <Button
          handleClick={() => navigate(`/requests/me`)}
          content="My Requests"
        />
      </Header>

      {/* FILTERS */}
      <Controls>
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="partially">Partially</option>
          <option value="not_satisfied">Not Satisfied</option>
        </Select>

        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </Select>

        <ResetBtn onClick={resetFilters}>Reset</ResetBtn>
      </Controls>

      {/* LIST */}
      {filtered.length > 0 ? (
        <List>
          {filtered.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              currentUser={user}
              categories={categories}
              onDonate={(req) => setSelectedRequest(req)}
            />
          ))}
        </List>
      ) : (
        <EmptyContainer>
          <EmptyImage src={noData} />
          <EmptyText>No requests available</EmptyText>
        </EmptyContainer>
      )}

      {/* MODAL */}
      {selectedRequest && (
        <DonationModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={async () => {
            setSelectedRequest(null);
            await fetchData();
          }}
        />
      )}

    </PageContainer>
  );
};