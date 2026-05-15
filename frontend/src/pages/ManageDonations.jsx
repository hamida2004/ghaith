import React, {
  useEffect,
  useState
} from "react";

import styled from "styled-components";

import axios from "../api/axios";

import { PageContainer } from "../components/PageContainer";

import { colors } from "../style/style";

import { useNavigate } from "react-router-dom";

// =====================
// STYLES
// =====================
const Title = styled.h1`
  color: ${colors.main};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;

  box-shadow:
    0 1px 4px
    rgba(0,0,0,0.08);
`;

const Row = styled.p`
  margin: 5px 0;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 10px;

  color: white;

  font-size: 12px;
  font-weight: 600;

  background: ${(p) =>
    p.$bg || "#999"};
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;

  margin-top: 12px;

  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 8px 14px;

  border: none;
  border-radius: 7px;

  cursor: pointer;

  font-weight: 600;

  background: ${(p) =>
    p.$bg || colors.main};

  color: white;
`;

const DispatchSection = styled.div`
  margin-top: 15px;

  padding-top: 12px;

  border-top:
    1px solid #eee;
`;

const Input = styled.input`
  padding: 8px;

  border-radius: 6px;
  border: 1px solid #ddd;
`;

const Select = styled.select`
  padding: 8px;

  border-radius: 6px;
  border: 1px solid #ddd;
`;

const NoteBox = styled.div`
  margin-top: 10px;

  background: #f7f8fa;

  border-left:
    4px solid ${colors.main};

  padding: 10px 12px;

  border-radius: 8px;

  font-size: 14px;

  color: #444;
`;

// =====================
// HELPERS
// =====================
const statusColor = (s) => ({
  pending_admin: "#f39c12",
  pending_assignment: "#8e44ad",
  pending_seeker: "#2980b9",
  confirmed: "#27ae60",
  rejected: "#e74c3c"
})[s] || "#999";

// =====================
// COMPONENT
// =====================
export const ManageDonations = () => {

  const [donations, setDonations] =
    useState([]);

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    dispatchRequest,
    setDispatchRequest
  ] = useState({});

  const [
    dispatchAmount,
    setDispatchAmount
  ] = useState({});

  const navigate =
    useNavigate();

  // =====================
  // FETCH
  // =====================
  const fetchData = async () => {

    try {

      setLoading(true);

      const [
        donationRes,
        requestRes
      ] = await Promise.all([

        axios.get(
          "/donations/all"
        ),

        axios.get(
          "/requests/all"
        )
      ]);

      setDonations(
        donationRes.data
      );

      const eligibleRequests =
        requestRes.data.filter(
          (r) =>

            r.status ===
              "accepted" &&

            r.donation_status !==
              "satisfied"
        );

      setRequests(
        eligibleRequests
      );

    } catch (err) {

      console.error(err);

      if (
        err.response?.status === 403
      ) {

        navigate("/not-found");
      }

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================
  // APPROVE / REJECT
  // =====================
  const handleValidate =
    async (id, approve) => {

      try {

        await axios.patch(
          `/donations/admin/${id}`,
          { approve }
        );

        fetchData();

      } catch (err) {

        console.error(err);

        alert(
          err.response?.data?.msg ||
          "Action failed"
        );
      }
    };

  // =====================
  // DISPATCH
  // =====================
  const handleDispatch =
    async (donationId) => {

      try {

        await axios.post(

          `/donations/admin/${donationId}/dispatch`,

          {
            request_id:
              dispatchRequest[
                donationId
              ],

            allocated_amount:
              dispatchAmount[
                donationId
              ]
          }
        );

        alert(
          "Dispatch created"
        );

        fetchData();

      } catch (err) {

        console.error(err);

        alert(
          err.response?.data?.msg ||
          "Dispatch failed"
        );
      }
    };

  // =====================
  // REMAINING
  // =====================
  const computeRemaining =
    (donation) => {

      const dispatches =
        donation.Dispatches || [];

      const used =
        dispatches.reduce(
          (sum, d) =>

            sum +

            parseFloat(
              d.allocated_amount ||
              d.amount ||
              0
            ),

          0
        );

      return (

        parseFloat(
          donation.amount || 0
        ) - used

      ).toFixed(2);
    };

  // =====================
  // UI
  // =====================
  return (
    <PageContainer>

      <Title>
        Manage Donations
      </Title>

      {loading ? (

        <p>Loading...</p>

      ) : donations.length > 0 ? (

        <List>

          {donations.map((d) => {

            const isFree =
              d.type === "free";

            const remaining =
              isFree
                ? computeRemaining(d)
                : null;

            return (
              <Card key={d.id}>

                {/* TYPE */}
                <Row>
                  <strong>
                    Type:
                  </strong>{" "}

                  {isFree
                    ? "Free donation"
                    : "Targeted donation"}
                </Row>

                {/* DONOR */}
                <Row>
                  <strong>
                    Donor:
                  </strong>{" "}

                  {d.Donor?.name}
                </Row>

                {/* REQUEST */}
                {d.Request && (
                  <Row>
                    <strong>
                      Request:
                    </strong>{" "}
                    {d.Request.title}
                  </Row>
                )}

                {/* AMOUNT */}
                <Row>
                  <strong>
                    Amount:
                  </strong>{" "}
                  {d.amount}
                </Row>

                {/* REMAINING */}
                {isFree && (
                  <Row>
                    <strong>
                      Remaining:
                    </strong>{" "}
                    {remaining}
                  </Row>
                )}

                {/* STATUS */}
                <Row>
                  <strong>
                    Status:
                  </strong>{" "}

                  <Badge
                    $bg={statusColor(
                      d.status
                    )}
                  >
                    {d.status}
                  </Badge>
                </Row>

                {/* NOTES */}
                {d.notes && (
                  <NoteBox>

                    <strong>
                      Description / Notes:
                    </strong>

                    <div
                      style={{
                        marginTop: 6
                      }}
                    >
                      {d.notes}
                    </div>

                  </NoteBox>
                )}

                {/* APPROVE / REJECT */}
                {d.status ===
                  "pending_admin" && (

                  <Actions>

                    <Button
                      $bg="#27ae60"
                      onClick={() =>
                        handleValidate(
                          d.id,
                          true
                        )
                      }
                    >
                      Approve
                    </Button>

                    <Button
                      $bg="#e74c3c"
                      onClick={() =>
                        handleValidate(
                          d.id,
                          false
                        )
                      }
                    >
                      Reject
                    </Button>

                  </Actions>
                )}

                {/* DISPATCHES */}
                {isFree &&
                  d.Dispatches
                    ?.length > 0 && (

                  <DispatchSection>

                    <h4>
                      Dispatches
                    </h4>

                    {d.Dispatches.map(
                      (ch) => (

                      <Card
                        key={ch.id}
                        style={{
                          marginTop: 10,
                          background:
                            "#f7f8fa"
                        }}
                      >

                        <Row>
                          <strong>
                            Request:
                          </strong>{" "}
                          {ch.Request
                            ?.title}
                        </Row>

                        <Row>
                          <strong>
                            Amount:
                          </strong>{" "}
                          {ch.allocated_amount}
                        </Row>

                        <Row>

                          <Badge
                            $bg={statusColor(
                              ch.status
                            )}
                          >
                            {ch.status}
                          </Badge>

                        </Row>

                        {ch.notes && (
                          <NoteBox>

                            <strong>
                              Dispatch Notes:
                            </strong>

                            <div
                              style={{
                                marginTop: 6
                              }}
                            >
                              {ch.notes}
                            </div>

                          </NoteBox>
                        )}

                      </Card>
                    ))}

                  </DispatchSection>
                )}

                {/* DISPATCH FORM */}
                {isFree &&

                  d.status ===
                    "pending_assignment" &&

                  parseFloat(
                    remaining
                  ) > 0 && (

                  <DispatchSection>

                    <h4>
                      Dispatch Donation
                    </h4>

                    <Actions>

                      <Select
                        value={
                          dispatchRequest[
                            d.id
                          ] || ""
                        }

                        onChange={(e) =>
                          setDispatchRequest({
                            ...dispatchRequest,

                            [d.id]:
                              e.target
                                .value
                          })
                        }
                      >

                        <option value="">
                          Select request
                        </option>

                        {requests.map(
                          (r) => (

                          <option
                            key={r.id}
                            value={r.id}
                          >

                            #{r.id} -{" "}
                            {r.title}

                          </option>
                        ))}

                      </Select>

                      <Input
                        type="number"

                        placeholder="Amount"

                        value={
                          dispatchAmount[
                            d.id
                          ] || ""
                        }

                        onChange={(e) =>
                          setDispatchAmount({
                            ...dispatchAmount,

                            [d.id]:
                              e.target
                                .value
                          })
                        }
                      />

                      <Button
                        onClick={() =>
                          handleDispatch(
                            d.id
                          )
                        }
                      >
                        Dispatch
                      </Button>

                    </Actions>

                  </DispatchSection>
                )}

              </Card>
            );
          })}

        </List>

      ) : (

        <p>
          No donations found
        </p>

      )}

    </PageContainer>
  );
};