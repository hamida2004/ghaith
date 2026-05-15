import React, {
  useEffect,
  useState
} from "react";

import styled from "styled-components";

import axios from "../api/axios";

import { PageContainer } from "../components/PageContainer";

import { UserCard } from "../components/UserCard";

import { colors } from "../style/style";

import { EmptyState } from "../components/EmptyState";

import { useNavigate } from "react-router-dom";

// =====================
// STYLES
// =====================
const Header = styled.div`
  margin-bottom: 25px;
`;

const Title = styled.h1`
  color: ${colors.main};
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Card = styled.div`
  background: white;
  padding: 15px;
  border-radius: 10px;

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button`
  padding: 6px 12px;

  border: none;
  border-radius: 6px;

  cursor: pointer;

  color: white;

  background:
    ${(p) =>
      p.$bg || colors.main};
`;

const Loader = styled.p`
  text-align: center;
`;

// =====================
// COMPONENT
// =====================
export const ManageUsers = () => {

  const [users, setUsers] =
    useState([]);

  const [
    adminRequests,
    setAdminRequests
  ] = useState([]);

  const [
    currentUserId,
    setCurrentUserId
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const navigate =
    useNavigate();

  // =====================
  // FETCH
  // =====================
  useEffect(() => {

    const fetchData =
      async () => {

      try {

        const [
          usersRes,
          meRes,
          adminReqRes
        ] = await Promise.all([

          axios.get("/users"),

          axios.get("/users/me"),

          axios.get(
            "/users/admin-requests"
          )
        ]);

        const cleanUsers =
          usersRes.data.map(
            (u) =>
              u.dataValues || u
          );

        const meId =
          meRes.data.id;

        setCurrentUserId(
          meId
        );

        // remove self
        setUsers(

          cleanUsers.filter(
            (u) =>
              u.id !== meId
          )
        );

        setAdminRequests(
          adminReqRes.data
        );

      } catch (err) {

        console.error(err);

        if (
          err.response?.status ===
          403
        ) {

          navigate(
            "/not-found"
          );
        }

      } finally {

        setLoading(false);
      }
    };

    fetchData();

  }, [navigate]);

  // =====================
  // HANDLE ADMIN REQUEST
  // =====================
  const handleAdminRequest =
    async (id, approve) => {

      try {

        await axios.patch(

          `/users/admin-request/${id}`,

          { approve }
        );

        // remove request
        setAdminRequests(
          (prev) =>

            prev.filter(
              (u) =>
                u.id !== id
            )
        );

        // update user role
        if (approve) {

          setUsers(
            (prev) =>

              prev.map((u) =>

                u.id === id

                  ? {
                      ...u,
                      is_admin: true
                    }

                  : u
              )
          );
        }

      } catch (err) {

        console.error(err);

        alert(
          "Action failed"
        );
      }
    };

  // =====================
  // FILTER
  // =====================
  const filteredUsers =
    users.filter((u) =>

      (u.name || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // =====================
  // UI
  // =====================
  return (
    <PageContainer>

      <Header>

        <Title>
          Manage Users
        </Title>

      </Header>

      {/* ADMIN REQUESTS */}
      <Section>

        <h2>
          Admin Requests
        </h2>

        {adminRequests.length >
        0 ? (

          <List>

            {adminRequests.map(
              (u) => (

              <Card key={u.id}>

                <div>

                  <strong>
                    {u.name}
                  </strong>

                  <p>
                    {u.email}
                  </p>

                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10
                  }}
                >

                  <Button
                    $bg={
                      colors.green
                    }

                    onClick={() =>
                      handleAdminRequest(
                        u.id,
                        true
                      )
                    }
                  >
                    Approve
                  </Button>

                  <Button
                    $bg={
                      colors.red
                    }

                    onClick={() =>
                      handleAdminRequest(
                        u.id,
                        false
                      )
                    }
                  >
                    Reject
                  </Button>

                </div>

              </Card>
            ))}

          </List>

        ) : (

          <p>
            No admin requests
          </p>

        )}

      </Section>

      {/* USERS */}
      <Section>

        <h2>
          All Users
        </h2>

        <Controls>

          <Input
            placeholder="Search users..."

            value={search}

            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </Controls>

        {loading ? (

          <Loader>
            Loading...
          </Loader>

        ) : filteredUsers.length >
          0 ? (

          <List>

            {filteredUsers.map(
              (u) => (

              <UserCard
                key={u.id}

                user={u}

                onToggleAdmin={
                  async () => {

                  try {

                    await axios.patch(
                      `/users/${u.id}/admin`
                    );

                    setUsers(
                      (prev) =>

                        prev.map(
                          (usr) =>

                            usr.id ===
                            u.id

                              ? {
                                  ...usr,

                                  is_admin:
                                    !usr.is_admin
                                }

                              : usr
                        )
                    );

                  } catch (error) {

                    console.error(
                      error
                    );

                    alert(
                      "Failed to update admin status"
                    );
                  }
                }}

                onViewDoc={() => {

                  const doc =
                    u.Documents?.[0];

                  if (!doc) {

                    return alert(
                      "No document available"
                    );
                  }

                  window.open(

                    `https://ghaith-gtkr.onrender.com${doc.file_path}`,

                    "_blank"
                  );
                }}
              />
            ))}

          </List>

        ) : (

          <EmptyState
            message="No users found"
          />

        )}

      </Section>

    </PageContainer>
  );
};