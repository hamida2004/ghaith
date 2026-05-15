import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "../api/axios";
import { PageContainer } from "../components/PageContainer";
import { colors } from "../style/style";
import { Button } from "../components/Button";
import { DonationModal } from "../components/DonationModal";

// =====================
// STYLES
// =====================
const Title = styled.h1`
  color: ${colors.main};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  border-left: 4px solid ${(p) => p.accent || colors.main};
`;

const CardLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${(p) => p.color || colors.main};
  margin-bottom: 8px;
`;

const Row = styled.p`
  margin: 4px 0;
  font-size: 14px;
`;

const Badge = styled.span`
  padding: 3px 10px;
  border-radius: 10px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  background: ${(p) => p.bg || "#999"};
`;

// ── Dispatch sub-list ──────────────────────────────────────────
const DispatchSection = styled.div`
  margin-top: 14px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
`;

const DispatchLabel = styled.p`
  font-size: 12px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
`;

const DispatchCard = styled.div`
  background: #f7f8fa;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 8px;
  border-left: 3px solid ${(p) => p.accent || "#ccc"};
`;

const ProgressBar = styled.div`
  margin-top: 6px;
  height: 6px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${(p) => Math.min(100, p.pct || 0)}%;
    background: ${(p) => p.color || colors.main};
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;

// =====================
// HELPERS
// =====================
const statusColor = (s) => ({
  pending_admin:      "#f39c12",
  pending_assignment: "#8e44ad",
  pending_seeker:     "#2980b9",
  confirmed:          "#27ae60",
  rejected:           "#e74c3c"
})[s] || "#999";

const statusLabel = (s) => ({
  pending_admin:      "Pending admin review",
  pending_assignment: "Approved — funds being allocated",
  pending_seeker:     "Awaiting recipient confirmation",
  confirmed:          "Confirmed",
  rejected:           "Rejected"
})[s] || s;

const computeDispatched = (donation) => {
  const dispatches = donation.Dispatches || [];

  const total = parseFloat(donation.amount || 0);

  const sent = dispatches
    .filter((d) => d.status !== "rejected")
    .reduce(
      (s, d) =>
        s + parseFloat(d.allocated_amount || d.amount || 0),
      0
    );

  const confirmed = dispatches
    .filter((d) => d.status === "confirmed")
    .reduce(
      (s, d) =>
        s + parseFloat(d.allocated_amount || d.amount || 0),
      0
    );

  return {
    total,
    sent,
    confirmed,
    remaining: total - sent
  };
};

// =====================
// COMPONENT
// =====================
export const UserDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW
  const [showFreeDonationModal, setShowFreeDonationModal] =
    useState(false);

  const fetchDonations = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/donations/me");

      setDonations(res.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // =====================
  // RENDER DONATION CARD
  // =====================
  const renderDonation = (d) => {
    const isFree = d.type === "free";

    const dispatches = d.Dispatches || [];

    const {
      total,
      sent,
      confirmed,
      remaining
    } = isFree
      ? computeDispatched(d)
      : {};

    const accentColor = isFree
      ? "#8e44ad"
      : colors.main;

    return (
      <Card key={d.id} accent={accentColor}>
        {/* HEADER */}
        <CardLabel color={accentColor}>
          {isFree
            ? "🟣 Free donation"
            : "🎯 Targeted donation"}
        </CardLabel>

        {/* REQUEST */}
        {d.Request && (
          <Row>
            <strong>Request:</strong>{" "}
            {d.Request.title}
          </Row>
        )}

        {/* AMOUNT */}
        <Row>
          <strong>Total amount:</strong>{" "}
          <strong style={{ color: accentColor }}>
            {d.amount}
          </strong>
        </Row>

        {/* STATUS */}
        <Row>
          <strong>Status:</strong>{" "}
          <Badge bg={statusColor(d.status)}>
            {statusLabel(d.status)}
          </Badge>
        </Row>

        {/* DATE */}
        <Row>
          <strong>Date:</strong>{" "}
          {new Date(d.createdAt).toLocaleDateString()}
        </Row>

        {/* NOTES */}
        {d.notes && (
          <Row>
            <strong>Notes:</strong> {d.notes}
          </Row>
        )}

        {/* FREE DONATION DETAILS */}
        {isFree && (
          <>
            <Row style={{ marginTop: 10 }}>
              <strong>Dispatched:</strong>{" "}
              {sent.toFixed(2)} / {total.toFixed(2)}

              {remaining > 0 && (
                <span
                  style={{
                    color: "#888",
                    fontSize: 12,
                    marginLeft: 6
                  }}
                >
                  ({remaining.toFixed(2)} remaining)
                </span>
              )}
            </Row>

            <ProgressBar
              pct={(sent / total) * 100}
              color={accentColor}
            />

            {/* DISPATCHES */}
            {dispatches.length > 0 && (
              <DispatchSection>
                <DispatchLabel>
                  Allocations made by admin
                </DispatchLabel>

                {dispatches.map((ch) => (
                  <DispatchCard
                    key={ch.id}
                    accent={statusColor(ch.status)}
                  >
                    <Row>
                      <strong>
                        {ch.Request?.title ||
                          `Request #${ch.request_id}`}
                      </strong>
                    </Row>

                    <Row>
                      Amount sent:{" "}
                      <strong>
                        {ch.allocated_amount ||
                          ch.amount}
                      </strong>
                    </Row>

                    <Row>
                      <Badge bg={statusColor(ch.status)}>
                        {statusLabel(ch.status)}
                      </Badge>
                    </Row>
                  </DispatchCard>
                ))}
              </DispatchSection>
            )}

            {/* WAITING */}
            {dispatches.length === 0 &&
              d.status === "pending_assignment" && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#888",
                    marginTop: 10,
                    fontStyle: "italic"
                  }}
                >
                  The admin will assign your donation
                  to a request shortly.
                </p>
              )}
          </>
        )}
      </Card>
    );
  };

  // =====================
  // UI
  // =====================
  return (
    <PageContainer>

      {/* HEADER + BUTTON */}
      <HeaderRow>
        <Title>My Donations</Title>

        <Button
          content="Make Free Donation"
          handleClick={() =>
            setShowFreeDonationModal(true)
          }
        />
      </HeaderRow>

      {/* MODAL */}
      {showFreeDonationModal && (
        <DonationModal
          request={null}
          onClose={() =>
            setShowFreeDonationModal(false)
          }
          onSuccess={() => {
            setShowFreeDonationModal(false);
            fetchDonations();
          }}
        />
      )}

      {/* LIST */}
      {loading ? (
        <p>Loading…</p>
      ) : donations.length > 0 ? (
        <List>
          {donations.map(renderDonation)}
        </List>
      ) : (
        <p>No donations yet.</p>
      )}
    </PageContainer>
  );
};