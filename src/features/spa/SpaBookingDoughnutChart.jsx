import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register essential Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// 🛠️ Safely implemented custom plugin
const centerTextPlugin = {
  id: "centerText",
  beforeDraw: (chart) => {
    const centerText = chart?.config?.options?.plugins?.centerText?.text ?? "";

    if (!centerText) return;

    const { ctx } = chart;
    const { width } = chart;
    const fontSize = width / 15;
    const textX = chart.getDatasetMeta(0).data[0].x;
    const textY = chart.getDatasetMeta(0).data[0].y;

    ctx.save();
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(centerText, textX, textY);
    ctx.restore();
  },
};

// Register the custom plugin
ChartJS.register(centerTextPlugin);

const SpaBookingDoughnutChart = ({ chartDto }) => {
  const chartData = useMemo(() => {
    const {
      noOfOccupiedRoomsCount = 0,
      noOfReservedRoomsCount = 0,
      noOfAvailableRoomsCount = 0,
      noOfNotReadyRoomsCount = 0,
    } = chartDto || {};

    return {
      labels: [
        "Occupied Rooms",
        "Reserved Rooms",
        "Available Rooms",
        "Not Ready Rooms",
      ],
      datasets: [
        {
          data: [
            noOfOccupiedRoomsCount,
            noOfReservedRoomsCount,
            noOfAvailableRoomsCount,
            noOfNotReadyRoomsCount,
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(201, 203, 207, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [chartDto]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        centerText: {
          text: `${chartDto?.noOfBookingRequestCount ?? 0}`,
        },
      },
      cutout: "60%",
      maintainAspectRatio: false,
    };
  }, [chartDto]);

  return <Doughnut data={chartData} options={chartOptions} />;
};

export default SpaBookingDoughnutChart;
