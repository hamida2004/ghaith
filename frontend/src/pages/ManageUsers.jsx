import React, { useState } from "react";
import styled from "styled-components";
import { PageContainer } from "../components/PageContainer";
import { UserCard } from "../components/UserCard";
import { colors } from "../style/style";
import { EmptyState } from "../components/EmptyState";

const Header = styled.div`
  display: flex;
  justify-content: space-between;
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

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const ManageUsers = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");



  const mockUsers = [
  {
    id: 1,
    name: "Ahmed Benali",
    email: "ahmed@mail.com",
    role: "donator",
    type: "person",
    status: "active",
    documents: ["id_ahmed.pdf"]
  },
  {
    id: 2,
    name: "Sara Foundation",
    email: "sara@org.com",
    role: "donation_seeker",
    type: "organization",
    status: "active",
    documents: ["org_sara.pdf"]
  },
  {
    id: 3,
    name: "Omar K",
    email: "omar@mail.com",
    role: "donation_seeker",
    type: "person",
    status: "pending",
    documents: ["id_omar.pdf"]
  },
  {
    id: 4,
    name: "Admin User",
    email: "admin@mail.com",
    role: "admin",
    type: "person",
    status: "active",
    documents: []
  },
  {
    id: 5,
    name: "Food Charity Org",
    email: "food@org.com",
    role: "donation_seeker",
    type: "organization",
    status: "active",
    documents: ["food_org.pdf"]
  },
  {
    id: 6,
    name: "Yasmine D",
    email: "yasmine@mail.com",
    role: "donator",
    type: "person",
    status: "active",
    documents: ["id_yasmine.pdf"]
  }
];

  const filtered = mockUsers
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
    .filter(u => roleFilter === "all" || u.role === roleFilter)
    .filter(u => typeFilter === "all" || u.type === typeFilter);

  return (
    <PageContainer>
      <Header>
        <Title>Manage Users</Title>
      </Header>

      <Controls>
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="donator">Donator</option>
          <option value="donation_seeker">Donation Seeker</option>
        </Select>

        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="person">Person</option>
          <option value="organization">Organization</option>
        </Select>
      </Controls>

      {filtered.length > 0 ? (
        <List>
          {filtered.map(u => (
            <UserCard key={u.id} user={u} />
          ))}
        </List>
      ) : (
        <EmptyState message="No users available" />
      )}
    </PageContainer>
  );
};