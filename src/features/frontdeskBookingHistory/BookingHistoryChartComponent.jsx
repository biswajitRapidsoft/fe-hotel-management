import React, { useCallback } from "react";

import { Box } from "@mui/material";
import Chart from "react-apexcharts";

const BookingHistoryChartComponent = ({
  dataCount,
  customLabels,
  totalLabel = "Total",
  showTotal = false,
  customHeight = 340,
  isActionable = false,
  pieSelectionFunction,
  customTotalKey = "",
  totalLabelFontSize = 20,
}) => {
  const sanitizedLabels = React.useMemo(() => {
    return (customLabels || []).map((label, index) => ({
      name: label?.name || `Label ${index + 1}`,
      key: label?.key || `defaultKey${index + 1}`,
      color: label?.color || "#64caf7",
      fontSize: "20px",
    }));
  }, [customLabels]);

  const pieSelectionFunctionOnClick = useCallback(
    (selectedPieData) => {
      if (pieSelectionFunction) {
        pieSelectionFunction(selectedPieData);
      } else {
        // Handle the case where pieSelectionFunction is not passed
        console.warn("Pie selection function not provided.");
      }
    },
    [pieSelectionFunction]
  );

  const series = React.useMemo(() => {
    return sanitizedLabels.map((label) => dataCount?.[label.key] || 0);
  }, [dataCount, sanitizedLabels]);

  const options = React.useMemo(
    () => ({
      labels: sanitizedLabels.map((label) => label.name),
      chart: {
        events: {
          dataPointSelection: (e, chartContext, config) => {
            if (e?.target?.attributes?.selected?.value) {
              e.target.attributes.selected.value = "false";
              const dataPointIndex = config.dataPointIndex;
              if (isActionable) {
                pieSelectionFunctionOnClick(
                  sanitizedLabels[dataPointIndex]?.key || null
                );
              }
            }
            // setSelectedChartLabel(
            //   config.w.config.labels[config.dataPointIndex]
            // );
          },
          // legendClick: (chartContext, seriesIndex, config) => {
          //   // This will trigger when a legend item is clicked
          //   if (isActionable) {
          //     pieSelectionFunctionOnClick(
          //       sanitizedLabels[seriesIndex]?.key || null
          //     );
          //   }
          // },
        },
      },

      colors: sanitizedLabels.map((label) => label.color),

      dataLabels: {
        formatter: function (val, opts) {
          return opts?.w?.config?.series[opts?.seriesIndex];
        },
        style: {
          fontSize: 18,
        },

        textAnchor: "middle",
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "center",
        // floating: false,
        fontSize: 14,
        // fontWeight: "bold",
        onItemClick: {
          toggleDataSeries: false, // Disable click on legend items
        },
        onItemHover: {
          highlightDataSeries: false, // Disable hover effect on legend items
        },
      },
      stroke: {
        show: false,
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: 60,
            labels: {
              show: true,
              value: {
                show: true,
                color: "#484848",
                fontSize: 37,
                fontWeight: "bold",
                offsetY: 15,
              },
              total: {
                show: showTotal,
                showAlways: showTotal,
                label: totalLabel || "Total",
                color: "black",
                fontSize: totalLabelFontSize,
                fontWeight: "bold",
                formatter: function () {
                  // If a specific key is provided, show its value
                  if (customTotalKey) {
                    return dataCount?.[customTotalKey] || 0; // Value for the specific key, default to 0 if not found
                  }
                  // Otherwise, calculate the sum of all values in dataCount
                  return sanitizedLabels.reduce(
                    (sum, label) => sum + (dataCount?.[label.key] || 0),
                    0
                  );
                },
              },
            },
          },
        },
      },
      tooltip: {
        enabled: true,
        style: {
          fontSize: "15.5px", // Font size for tooltip text
        },
      },
    }),
    [
      sanitizedLabels,
      showTotal,
      totalLabel,
      isActionable,
      pieSelectionFunctionOnClick,
      dataCount,
      customTotalKey,
      totalLabelFontSize,
    ]
  );

  return (
    <Box
      sx={{
        // width: "90%",
        width: "100%",
        // position: "relative",
      }}
    >
      <Chart
        options={options}
        series={series}
        type="donut"
        width="100%"
        height={customHeight}
      />
    </Box>
  );
};

export default BookingHistoryChartComponent;
