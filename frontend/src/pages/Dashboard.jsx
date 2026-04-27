import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { colors } from "../style/style";
import axios from "../api/axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { CustomLink } from "../components/CustomLink";
import { PageContainer } from "../components/PageContainer";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

// =====================
// STYLES
// =====================
const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  width: 100%;
`;

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  margin: 20px;
`;

const TopCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StatBox = styled.div`
  flex: 1;
  text-align: center;
`;

const Title = styled.h3`
  margin-bottom: 10px;
`;

// =====================
// COMPONENT
// =====================
export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("/dashboard");
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
  }, []);

  if (!data) return <PageContainer>Loading...</PageContainer>;

  // =====================
  // CHART DATA (DYNAMIC)
  // =====================

  const lineData = {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul"],
    datasets: [
      {
        label: "Requests",
        data: data.requestsPerMonth,
        borderColor: colors.main,
        tension: 0.4,
      },
    ],
  };

  const doughnutData = {
    labels: ["Satisfied","Partially","Not Satisfied"],
    datasets: [
      {
        data: [
          data.donationStatus.satisfied,
          data.donationStatus.partially,
          data.donationStatus.not_satisfied,
        ],
        backgroundColor: [colors.main, colors.yellow, colors.red],
      },
    ],
  };

  const barData = {
    labels: Object.keys(data.requestsPerCategory),
    datasets: [
      {
        label: "Requests per Category",
        data: Object.values(data.requestsPerCategory),
        backgroundColor: colors.main,
      },
    ],
  };

  return (
    <PageContainer>
      {/* STATS */}
      <TopCard>
        <Stats>
          <StatBox>
            <h2>{data.totalUsers}</h2>
            <p>Total Users</p>
          </StatBox>

          <StatBox>
            <h2>{data.totalRequests}</h2>
            <p>Total Requests</p>
          </StatBox>

          <CustomLink
            content={"Go To Home Page"}
            color={colors.main}
            to={"/"}
          />
        </Stats>
      </TopCard>

      {/* GRID */}
      <Grid>
        <div>
          <Card>
            <Title>Activity</Title>
            <Line data={lineData} />
          </Card>

          <Card>
            <Title>Requests per Category</Title>
            <Bar data={barData} />
          </Card>
        </div>

        <div>
          <Card>
            <Title>Donation Status</Title>
            <Doughnut data={doughnutData} />
          </Card>
        </div>
      </Grid>
    </PageContainer>
  );
}