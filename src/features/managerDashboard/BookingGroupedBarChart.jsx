import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BookingGroupedBarChart = ({ bookingData }) => {
  const chartData = useMemo(() => {
    // const filteredDates = Object.keys(bookingData)
    //   .filter((date) =>
    //     Object.values(bookingData[date]).some((value) => value > 0)
    //   )
    //   .sort((a, b) => new Date(a) - new Date(b));

    const allDates = Object.keys(bookingData).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    return {
      // labels: filteredDates.map((date) => {
      labels: allDates.map((date) => {
        const [year, month, day] = date.split("-");
        console.log("Unused year:", year);
        return `${day}/${month}`;
      }),
      datasets: [
        {
          label: "Checked Out",
          // data: filteredDates.map((date) => bookingData[date]["Checked_Out"]),
          data: allDates.map((date) => bookingData[date]["Checked_Out"]),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
        {
          label: "Checked In",
          data: allDates.map((date) => bookingData[date]["Checked_In"]),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
        },
        {
          label: "Booked",
          data: allDates.map((date) => bookingData[date]["Booked"]),
          backgroundColor: "rgba(255, 206, 86, 0.6)",
        },
        {
          label: "Pending Confirmation",
          data: allDates.map(
            (date) => bookingData[date]["Pending_Confirmation"]
          ),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  }, [bookingData]);

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      //   title: {
      //     display: true,
      //     text: "Daily Booking Status",
      //   },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Bookings",
        },
        ticks: {
          stepSize: 2,
          beginAtZero: true,
        },
        suggestedMax:
          Math.max(...Object.values(bookingData).flatMap(Object.values)) + 5,
      },
    },
    maintainAspectRatio: false,
  };

  return <Bar data={chartData} options={chartOptions} />;
};

export default BookingGroupedBarChart;
