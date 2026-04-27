import React, { useState } from "react";
import styled from "styled-components";
import { PageContainer } from "../components/PageContainer";
import { RequestCard } from "../components/RequestCard";
import { colors } from "../style/style";
import { EmptyState } from "../components/EmptyState";

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

// =====================
// COMPONENT
// =====================
export const ManageRequests = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [donationFilter, setDonationFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

const mockRequests = [
  {
    id: 1,
    title: "Help for surgery",
    description: "Urgent medical help needed",
    category: "Health",
    target_amount: 5000,
    collected_amount: 3000,
    donation_status: "partially",
    status: "accepted",
    type: "money",
    date: "2024-04-01",
    user: { name: "Ahmed" }
  },
  {
    id: 2,
    title: "School supplies",
    description: "Books for children",
    category: "Education",
    target_amount: 1000,
    collected_amount: 1000,
    donation_status: "satisfied",
    status: "accepted",
    type: "things",
    date: "2024-04-10",
    user: { name: "Sara" }
  },
  {
    id: 3,
    title: "Food aid",
    description: "Family in need",
    category: "Food",
    target_amount: 800,
    collected_amount: 100,
    donation_status: "not_satisfied",
    status: "pending",
    type: "money",
    date: "2024-04-15",
    user: { name: "Omar" }
  }
];

  const filtered = mockRequests
    .filter(r => r.title.toLowerCase().includes(search.toLowerCase()))
    .filter(r => statusFilter === "all" || r.status === statusFilter)
    .filter(r => donationFilter === "all" || r.donation_status === donationFilter)
    .sort((a, b) =>
      sortOrder === "desc"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

  return (
    <PageContainer>
      <Header>
        <Title>Manage Requests</Title>
      </Header>

      <Controls>
        <Input
          placeholder="Search requests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="refused">Refused</option>
        </Select>

        <Select value={donationFilter} onChange={(e) => setDonationFilter(e.target.value)}>
          <option value="all">All Donation</option>
          <option value="satisfied">Satisfied</option>
          <option value="partially">Partially</option>
          <option value="not_satisfied">Not Satisfied</option>
        </Select>

        <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </Select>

        <ResetBtn onClick={() => {
          setSearch("");
          setStatusFilter("all");
          setDonationFilter("all");
          setSortOrder("desc");
        }}>
          Reset
        </ResetBtn>
      </Controls>

      {filtered.length > 0 ? (
        <List>
          {filtered.map(r => (
            <RequestCard key={r.id} request={r} />
          ))}
        </List>
      ) : (
        <EmptyState message="No requests available" />
      )}
    </PageContainer>
  );
};