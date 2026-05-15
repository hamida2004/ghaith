import React, {
  useEffect,
  useState
} from "react";

import styled from "styled-components";

import axios from "../api/axios";

import { useNavigate } from "react-router-dom";

import { PageContainer } from "../components/PageContainer";

import { colors } from "../style/style";

import { EmptyState } from "../components/EmptyState";

import { CreateRequestModal } from "../components/CreateRequestModal";

import { Button } from "../components/Button";

// =====================
// STYLES
// =====================
const Header = styled.div`
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
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
`;

const DonationBox = styled.div`
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
  color: white;
  background: ${(p) => p.$bg};
`;

// =====================
// HELPERS
// =====================
const getStatusColor = (
  status
) => {

  if (status === "pending") {
    return colors.yellow;
  }

  if (status === "accepted") {
    return colors.green;
  }

  if (status === "refused") {
    return colors.red;
  }

  return "#999";
};

// =====================
// COMPONENT
// =====================
export const UserRequests = () => {

  const navigate = useNavigate();

  const [requests, setRequests] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [
    pendingDonations,
    setPendingDonations
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [openModal, setOpenModal] =
    useState(false);

  // =====================
  // FETCH DATA
  // =====================
  const fetchData = async () => {

    setLoading(true);

    try {

      // USER
      const userRes =
        await axios.get("/users/me");

      const user =
        userRes.data;

      // ONLY SEEKERS
      if (
        user.role !== "seeker"
      ) {

        navigate("/");

        return;
      }

      // FETCH
      const [
        reqRes,
        catRes,
        donationRes
      ] = await Promise.all([

        axios.get("/requests/me"),

        axios.get("/categories"),

        axios.get(
          "/donations/pending"
        )
      ]);

      setRequests(
        reqRes.data || []
      );

      setCategories(
        catRes.data || []
      );

      setPendingDonations(
        donationRes.data || []
      );

    } catch (err) {

      console.error(err);

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {

        navigate("/");
      }

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================
  // CREATE REQUEST
  // =====================
  const createRequest = async (
    formData
  ) => {

    try {

      await axios.post(
        "/requests",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data"
          }
        }
      );

      setOpenModal(false);

      fetchData();

    } catch (err) {

      console.error(
        err.response?.data ||
        err
      );

      alert(
        err.response?.data?.msg ||
        "Failed to create request"
      );
    }
  };

  // =====================
  // SEEKER VALIDATION
  // =====================
  const handleDonationStatus =
    async (id, status) => {

      try {

        await axios.patch(
          `/donations/${id}/status`,
          { status }
        );

        fetchData();

      } catch (err) {

        console.error(err);

        alert(
          "Failed to update donation"
        );
      }
    };

  // =====================
  // UI
  // =====================
  return (
    <PageContainer>

      {/* HEADER */}
      <Header>

        <Title>
          My Requests
        </Title>

        <Button
          handleClick={() =>
            setOpenModal(true)
          }
          content="+ Add Request"
        />

      </Header>

      {/* LOADING */}
      {loading ? (

        <p>Loading...</p>

      ) : requests.length > 0 ? (

        <List>

          {requests.map((r) => {

            const related =
              pendingDonations.filter(
                (d) =>
                  d.request_id ===
                  r.id
              );

            return (
              <Card key={r.id}>

                {/* HEADER */}
                <h3>{r.title}</h3>

                <Badge
                  $bg={getStatusColor(
                    r.status
                  )}
                >
                  {r.status}
                </Badge>

                {/* DETAILS */}
                <p>
                  <strong>
                    Description:
                  </strong>{" "}
                  {r.description ||
                    "No description"}
                </p>

                <p>
                  <strong>Type:</strong>{" "}
                  {r.type}
                </p>

                {/* FINANCIAL */}
                <p>
                  <strong>Target:</strong>{" "}
                  {r.target_amount}
                </p>

                <p>
                  <strong>
                    Collected:
                  </strong>{" "}
                  {r.collected_amount}
                </p>

                <p>
                  <strong>
                    Progress:
                  </strong>{" "}

                  {Math.min(
                    100,
                    Math.round(
                      (
                        parseFloat(
                          r.collected_amount || 0
                        ) /

                        parseFloat(
                          r.target_amount || 1
                        )
                      ) * 100
                    )
                  )}

                  %
                </p>

                <p>
                  <strong>
                    Donation Status:
                  </strong>{" "}
                  {r.donation_status}
                </p>

                {/* PERSONAL */}
                <p>
                  <strong>Phone:</strong>{" "}
                  {r.phone}
                </p>

                <p>
                  <strong>
                    Address:
                  </strong>{" "}
                  {r.address}
                </p>

                <p>
                  <strong>
                    Occupation:
                  </strong>{" "}
                  {r.occupation}
                </p>

                {/* URGENCY */}
                <p>
                  <strong>
                    Urgency:
                  </strong>{" "}

                  <Badge
                    $bg={
                      r.urgency >= 4
                        ? colors.red
                        : r.urgency >= 2
                        ? colors.yellow
                        : colors.green
                    }
                  >
                    {r.urgency}/5
                  </Badge>
                </p>

                {/* DOCUMENT */}
                <p>
                  <strong>
                    Document:
                  </strong>{" "}

                  {r.document ? (
                    <a
                      href={`https://ghaith-gtkr.onrender.com${r.document}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    "None"
                  )}
                </p>

                {/* DATE */}
                <p>
                  <strong>
                    Created:
                  </strong>{" "}

                  {new Date(
                    r.createdAt
                  ).toLocaleDateString()}
                </p>

                {/* DONATIONS */}
                {related.length > 0 && (
                  <>

                    <h4
                      style={{
                        marginTop: 15
                      }}
                    >
                      Pending Donations
                    </h4>

                    {related.map((d) => (

                      <DonationBox
                        key={d.id}
                      >

                        <p>
                          <strong>
                            Donor:
                          </strong>{" "}

                          {d.Donor?.name ||
                            "Unknown"}
                        </p>

                        <p>
                          <strong>
                            Amount:
                          </strong>{" "}
                          {d.amount}
                        </p>

                        {d.notes && (
                          <p>
                            <strong>
                              Notes:
                            </strong>{" "}
                            {d.notes}
                          </p>
                        )}

                        <Actions>

                          <Button
                            color={
                              colors.green
                            }
                            handleClick={() =>
                              handleDonationStatus(
                                d.id,
                                "confirmed"
                              )
                            }
                            content="Confirm"
                          />

                          <Button
                            color={
                              colors.red
                            }
                            handleClick={() =>
                              handleDonationStatus(
                                d.id,
                                "rejected"
                              )
                            }
                            content="Reject"
                          />

                        </Actions>

                      </DonationBox>
                    ))}

                  </>
                )}

              </Card>
            );
          })}

        </List>

      ) : (

        <EmptyState
          message="No requests"
        />

      )}

      {/* MODAL */}
      {openModal && (
        <CreateRequestModal
          onClose={() =>
            setOpenModal(false)
          }
          onCreate={createRequest}
          categories={categories}
        />
      )}

    </PageContainer>
  );
};