import React from "react";
import styled from "styled-components";
import { colors } from "../style/style";
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

// =====================
// REGISTER CHARTS
// =====================
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
const Container = styled.div`
  padding: 30px;
  padding-left:60px
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  width:100%;
`;

const Card = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  margin:20px
 
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
  margin-bottom: 20px;
`;

const StatBox = styled.div`
  flex: 1;
  text-align: center;
`;

const Title = styled.h3`
  margin-bottom: 10px;
`;

// =====================
// MOCK DATA
// =====================

// LINE CHART (activity)
const lineData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Requests",
      data: [20, 35, 60, 45, 50, 55, 70],
      borderColor: colors.main,
      tension: 0.4,
    },
  ],
};

// DOUGHNUT (status)
const doughnutData = {
  labels: ["Satisfied","Partially Satisfied" ,"Not Satisfied"],
  datasets: [
    {
      data: [88, 12,23],
      backgroundColor: [colors.main, colors.yellow, colors.red],
    },
  ],
};

// BAR (requests per category) ✅
const barData = {
  labels: ["Health", "Food", "Education", "Clothes", "Housing"],
  datasets: [
    {
      label: "Requests per Category",
      data: [120, 90, 150, 70, 60],
      backgroundColor: colors.main,
    },
  ],
};

// =====================
// COMPONENT
// =====================
export default function Dashboard() {
  return (
    <PageContainer>

      {/* STATS */}
      <TopCard>
        <Stats>
          <StatBox>
            <h2>89,935</h2>
            <p>Total Users</p>
          </StatBox>

          <StatBox>
            <h2>23,283</h2>
            <p>Total Requests</p>
          </StatBox>

          <CustomLink 
          content={"Go To Home Page"}
          color={colors.main}
          to={'/'}
          />
           
        </Stats>
      </TopCard>

      {/* MAIN GRID */}
      <Grid
      
      >

        {/* LEFT SIDE */}
        <div
       
        >
          <Card>
            <Title>Activity</Title>
            <Line data={lineData} />
          </Card>

          <Card style={{ marginTop: "20px" }}>
            <Title>Requests per Category</Title>
            <Bar data={barData} />
          </Card>
        </div>

        {/* RIGHT SIDE */}
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