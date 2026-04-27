import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { colors } from "../style/style";
import { RequestCard } from "../components/RequestCardUser";
import { DonationModal } from "../components/DonationModal";
import { PageContainer } from "../components/PageContainer";
import { Button } from "../components/Button";
import noData from "../assets/images/noData.svg";

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

// EMPTY STATE
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
// MOCK DATA
// =====================
const mockRequests = [
  {
    id: 1,
    title: "Medical Help",
    category: "Health",
    donation_status: "partially",
    description: "Urgent surgery",
    target_amount: 5000,
    collected_amount: 2000,
    date: "2024-04-10",
    user: { id: 2, name: "Ahmed" }
  },
  {
    id: 2,
    title: "Food Support",
    category: "Food",
    donation_status: "not_satisfied",
    description: "Family in need",
    target_amount: 800,
    collected_amount: 100,
    date: "2024-04-15",
    user: { id: 3, name: "Sara" }
  }
];

// =====================
// COMPONENT
// =====================
export const HomePage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("desc");
  const [selectedRequest, setSelectedRequest] = useState(null);

  // =====================
  // DYNAMIC CATEGORIES
  // =====================
  const categories = [
    "all",
    ...new Set(mockRequests.map(r => r.category))
  ];

  // =====================
  // FILTER
  // =====================
  const filtered = mockRequests
    .filter(r =>
      r.title.toLowerCase().includes(search.trim().toLowerCase())
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

  // =====================
  // RESET
  // =====================
  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setStatus("all");
    setSort("desc");
  };

  return (
    <PageContainer>

      {/* HEADER */}
      <Header>
        <Title>Available Requests</Title>

        <Button
          onClick={() => navigate("/requests/1")}
          content="My Requests"
        />
      </Header>

      {/* FILTERS */}
      <Controls>
        <Input
          placeholder="Search requests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map(c => (
            <option key={c} value={c}>
              {c === "all" ? "All Categories" : c}
            </option>
          ))}
        </Select>

        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All Status</option>
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

        <ResetBtn onClick={resetFilters}>
          Reset
        </ResetBtn>
      </Controls>

      {/* LIST OR EMPTY */}
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
          <EmptyImage src={noData} alt="no data" />
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