import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "../api/axios";
import { PageContainer } from "../components/PageContainer";
import { UserCard } from "../components/UserCard";
import { colors } from "../style/style";
import { EmptyState } from "../components/EmptyState";

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

const Loader = styled.p`
  text-align: center;
`;

// =====================
// COMPONENT
// =====================
export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // =====================
  // FETCH USERS
  // =====================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // =====================
  // ACTIONS
  // =====================

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/users/${id}/status`, { status });

      setUsers(prev =>
        prev.map(u =>
          u.id === id ? { ...u, status } : u
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAdmin = async (id) => {
    try {
      await axios.patch(`/users/${id}/admin`);

      setUsers(prev =>
        prev.map(u =>
          u.id === id ? { ...u, is_admin: !u.is_admin } : u
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateDocument = async (docId, status, reason = null) => {
    try {
      await axios.patch(`/users/documents/${docId}`, {
        status,
        rejection_reason: reason
      });

      // refresh UI
      setUsers(prev =>
        prev.map(u => ({
          ...u,
          Documents: u.Documents?.map(d =>
            d.id === docId
              ? { ...d, status, rejection_reason: reason }
              : d
          )
        }))
      );

    } catch (err) {
      console.error(err);
    }
  };

  // =====================
  // FILTER
  // =====================
  const filtered = users
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(u => {
      if (roleFilter === "all") return true;

      if (roleFilter === "admin") return u.is_admin;

      return !u.is_admin && u.role === roleFilter;
    })
    .filter(u => typeFilter === "all" || u.type === typeFilter);

  // =====================
  // UI
  // =====================
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

        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="donator">Donator</option>
          <option value="donation_seeker">Donation Seeker</option>
        </Select>

        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="person">Person</option>
          <option value="organization">Organization</option>
        </Select>
      </Controls>

      {loading ? (
        <Loader>Loading...</Loader>
      ) : filtered.length > 0 ? (
        <List>
          {filtered.map(u => (
            <UserCard
              key={u.id}
              user={u}

              // ADMIN ACTIONS
              onActivate={() => updateStatus(u.id, "active")}
              onReject={() => updateStatus(u.id, "rejected")}
              onToggleAdmin={() => toggleAdmin(u.id)}

              onApproveDoc={(docId) =>
                updateDocument(docId, "approved")
              }

              onRejectDoc={(docId) => {
                const reason = prompt("Rejection reason:");
                if (!reason) return;

                updateDocument(docId, "rejected", reason);
              }}
            />
          ))}
        </List>
      ) : (
        <EmptyState message="No users available" />
      )}
    </PageContainer>
  );
};