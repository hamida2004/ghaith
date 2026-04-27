import React, { useState } from "react";
import styled from "styled-components";
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

export const UserRequests = () => {
  
  
  const mockUserRequests = [
  {
    id: 1,
    title: "Heart Surgery Assistance",
    donations: [
      {
        id: 1,
        donor: "Ahmed Benali",
        amount: 500,
        confirmed: true
      },
      {
        id: 2,
        donor: "Yasmine D",
        amount: 1000,
        confirmed: false
      }
    ]
  },
  {
    id: 2,
    title: "Clothes for Winter",
    donations: [
      {
        id: 3,
        donor: "Ahmed Benali",
        amount: 200,
        confirmed: false
      }
    ]
  },
  {
    id: 3,
    title: "Food Packages",
    donations: []
  }
];
const [requests, setRequests] = useState(mockUserRequests);
const confirmDonation = (reqId, donationId) => {
  setRequests(prev =>
    prev.map(r =>
        r.id === reqId
          ? {
              ...r,
              donations: r.donations.map(d =>
                d.id === donationId
                  ? { ...d, confirmed: true }
                  : d
              )
            }
          : r
      )
    );
  };

  return (
    <PageContainer>
      <Header>
        <Title>My Requests</Title>
      </Header>

      {requests.length > 0 ? (
        <List>
          {requests.map(r => (
            <Card key={r.id}>
              <h3>{r.title}</h3>

              {r.donations.map(d => (
                <div key={d.id}>
                  <p>Amount: {d.amount}</p>
                  <p>Status: {d.confirmed ? "Confirmed" : "Pending"}</p>

                  {!d.confirmed && (
                    <Button onClick={() => confirmDonation(r.id, d.id)}>
                      Confirm Donation
                    </Button>
                  )}
                </div>
              ))}
            </Card>
          ))}
        </List>
      ) : (
        <EmptyState message="No requests available" />
      )}
    </PageContainer>
  );
};