import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { colors } from "../style/style";
import { RequestCard } from "../components/RequestCardUser";
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
  min-width: 200px;
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
  justify-content: center;
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
  const [user, setUser] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("desc");

  const [selectedRequest, setSelectedRequest] = useState(null);

  // =====================
  // FETCH DATA
  // =====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = 1;

        const [reqRes, aiRes, userRes] = await Promise.all([
          axios.get("/requests"),
          ai.get(`/recommend/${userId}`),
          axios.get("/users/me")
        ]);

        setUser(userRes.data);
        console.log(user,"/////////////////////////")
        console.log(reqRes.data,"/////////////////////////")

        const filteredRequests = reqRes.data.filter(
          r => r.donation_status !== "satisfied"
        );

        setRequests(filteredRequests || reqRes.data);
        setRecommended(aiRes.data.recommendations || []);

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // =====================
  // MERGE
  // =====================
  const merged = [
    ...recommended,
    ...requests.filter(
      r => !recommended.find(rec => rec.id === r.id)
    )
  ];

  const categories = [
    "all",
    ...new Set(merged.map(r => r.category))
  ];

  const filtered = merged
    .filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter(r => category === "all" || r.category === category)
    .filter(r =>
      status === "all" ? true : r.donation_status === status
    )
    .sort((a, b) =>
      sort === "desc"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setStatus("all");
    setSort("desc");
  };

  return (
    <PageContainer>

      {/* STATUS BANNER */}
      {user && user.status !== "active" && (
        <Banner>
          <span>
            Your account is <strong>{user.status}</strong>. Upload your document to activate it.
          </span>

          <Button
            handleClick={() => navigate("/profile/1")}
            content="Activate"
          />
        </Banner>
      )}

      {/* HEADER */}
      <Header>
        <Title>Available Requests</Title>

        <Button
          handleClick={() => navigate("/requests/1")}
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

        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map(c => (
            <option key={c} value={c}>
              {c === "all" ? "All Categories" : c}
            </option>
          ))}
        </Select>

        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="partially">Partially</option>
          <option value="not_satisfied">Not Satisfied</option>
        </Select>

        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </Select>

        <ResetBtn onClick={resetFilters}>Reset</ResetBtn>
      </Controls>

      {/* LIST */}
      {filtered.length > 0 ? (
        <List>
          {filtered.map(r => (
            <RequestCard
              key={r.id}
              request={r}
              onDonate={() => setSelectedRequest(r)}
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
        />
      )}
    </PageContainer>
  );
};