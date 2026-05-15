import React, {
  useState,
  useMemo
} from "react";

import styled from "styled-components";

import { colors } from "../style/style";

import { Button } from "./Button";

// =====================
// STYLES
// =====================
const Card = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow:
    0 0 10px
    rgba(0,0,0,0.05);
`;

const Header = styled.div`
  cursor: pointer;
`;

const Title = styled.h4`
  margin: 0;
`;

const Details = styled.div`
  margin-top: 10px;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 8px;
`;

const Progress = styled.div`
  height: 100%;
  background: ${colors.main};
  width: ${(p) => p.$value}%;
`;

const Actions = styled.div`
  margin-top: 10px;
`;

// =====================
// COMPONENT
// =====================
export const RequestCard = ({
  request,
  categories = [],
  onDonate,
  currentUser
}) => {

  const [open, setOpen] =
    useState(false);

  // =====================
  // CATEGORY
  // =====================
  const categoryName =
    useMemo(() => {

      const found =
        categories.find(
          (c) =>
            Number(c.id) ===
            Number(
              request.category_id
            )
        );

      return (
        found?.name ||
        "No category"
      );

    }, [
      categories,
      request.category_id
    ]);

  // =====================
  // PROGRESS
  // =====================
  const progress =
    useMemo(() => {

      if (
        !request.target_amount
      ) {
        return 0;
      }

      return Math.min(

        (
          parseFloat(
            request.collected_amount || 0
          ) /

          parseFloat(
            request.target_amount
          )
        ) * 100,

        100
      );

    }, [request]);

  // =====================
  // ROLE RULES
  // =====================

  // seeker owns request
  const isOwner =
    Number(currentUser?.id) ===
    Number(request.seeker_id);

  // admin detection
  const isAdmin =

    currentUser?.is_admin === true ||

    currentUser?.role ===
      "admin";

  // donator role
  const isDonator =
    currentUser?.role ===
    "donator";

  // final permission
  const canDonate =

    !isAdmin &&

    isDonator &&

    !isOwner &&

    request.status ===
      "accepted" &&

    request.donation_status !==
      "satisfied";

  // =====================
  // UI
  // =====================
  return (
    <Card>

      <Header
        onClick={() =>
          setOpen(!open)
        }
      >

        <Title>
          {request.title}
        </Title>

        <p>
          {categoryName}
        </p>

        <ProgressBar>

          <Progress
            $value={progress}
          />

        </ProgressBar>

        <small>

          {request.collected_amount || 0}

          {" / "}

          {request.target_amount || 0}

        </small>

      </Header>

      {open && (

        <Details>

          <p>
            {request.description}
          </p>

          <Actions>

            {canDonate && (

              <Button
                content="Donate"
                handleClick={() =>
                  onDonate(request)
                }
              />

            )}

          </Actions>

        </Details>

      )}

    </Card>
  );
};