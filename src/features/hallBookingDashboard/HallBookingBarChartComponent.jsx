import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const HallBookingBarChartComponent = ({ data }) => {
  console.log("data for Barchart", data);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    const dataEntries = Object.entries(data);

    console.log("dataEntries: ", dataEntries);

    const monthOrder = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    dataEntries.sort(
      (a, b) => monthOrder.indexOf(a[0]) - monthOrder.indexOf(b[0])
    );

    const labels = dataEntries.map((monthData) =>
      monthData[0].substring(0, 3).toUpperCase()
    );
    console.log("barchart labels: ", labels);

    const monthlyBookings = dataEntries.map((monthData) => monthData[1]);

    const chartData = {
      labels: labels,
      datasets: [
        {
          data: monthlyBookings,
          backgroundColor: "#7ABDEA",
          barPercentage: 1.0,
          label: "Bookings",
        },
      ],
    };

    const config = {
      type: "bar",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        layout: {
          padding: {
            top: 50,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              font: { weight: "bold" },
              color: "black",
              text: "MONTHS",
            },
            ticks: {
              color: "black",
              font: { size: 11, weight: "bold" },
            },
            grid: {
              color: "#B3BBCC",
            },
          },
          y: {
            beginAtZero: true,
            grace: 1,
            title: {
              display: true,
              font: { weight: "bold" },
              color: "black",
              text: "BOOKINGS",
            },
            ticks: {
              color: "black",
              font: { size: 11, weight: "bold" },
            },
            grid: {
              color: "#B3BBCC",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    };

    const chartInstance = new Chart(chartRef.current, config);

    return () => {
      chartInstance.destroy();
    };
  }, [data]);

  return (
    <div
      style={{
        width: "100%",
        height: "97%",
        display: "flex",
        // justifyContent: "center",
        justifyContent: "flex-start",
      }}
    >
      <canvas ref={chartRef} id="myChart"></canvas>
    </div>
  );
};

export default HallBookingBarChartComponent;
