import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "../api/axios";
import { PageContainer } from "../components/PageContainer";
import { colors } from "../style/style";
import { EmptyState } from "../components/EmptyState";

const Header = styled.div`
  margin-bottom: 25px;
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
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
`;

const Button = styled.button`
  padding: 10px;
  background: ${colors.main};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const Loader = styled.p`
  text-align: center;
`;

export const UserRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================
  // FETCH USER REQUESTS
  // =====================
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/requests/me");
        setRequests(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  // =====================
  // CONFIRM DONATION
  // =====================
  const confirmDonation = async (donationId) => {
    try {
      await axios.patch(`/donations/${donationId}/confirm`);

      // optimistic update
      setRequests(prev =>
        prev.map(r => ({
          ...r,
          Donations: r.Donations?.map(d =>
            d.id === donationId
              ? { ...d, confirmed: true }
              : d
          )
        }))
      );

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>My Requests</Title>
      </Header>

      {loading ? (
        <Loader>Loading...</Loader>
      ) : requests.length > 0 ? (
        <List>
          {requests.map(r => (
            <Card key={r.id}>
              <h3>{r.title}</h3>

              {r.Donations?.length > 0 ? (
                r.Donations.map(d => (
                  <div key={d.id}>
                    <p>Amount: {d.amount}</p>
                    <p>Status: {d.confirmed ? "Confirmed" : "Pending"}</p>

                    {!d.confirmed && (
                      <Button onClick={() => confirmDonation(d.id)}>
                        Confirm Donation
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p>No donations yet</p>
              )}
            </Card>
          ))}
        </List>
      ) : (
        <EmptyState message="No requests available" />
      )}
    </PageContainer>
  );
};