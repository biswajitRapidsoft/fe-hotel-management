import React, { useCallback } from "react";

import { Box } from "@mui/material";
import Chart from "react-apexcharts";

const HallBookingChartComponent = ({
  dataCount,
  customLabels,
  totalLabel = "Total",
  showTotal = false,
  customHeight = 230,
  isActionable = false,
  pieSelectionFunction,
}) => {
  const sanitizedLabels = React.useMemo(() => {
    return (customLabels || []).map((label, index) => ({
      name: label?.name || `Label ${index + 1}`,
      key: label?.key || `defaultKey${index + 1}`,
      color: label?.color || "#64caf7",
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
        },
      },

      colors: sanitizedLabels.map((label) => label.color),

      dataLabels: {
        formatter: function (val, opts) {
          return opts?.w?.config?.series[opts.seriesIndex];
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
        floating: false,
        fontSize: 14.5,
      },
      stroke: {
        show: false,
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          donut: {
            size: 64,
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
                fontSize: 20,
                fontWeight: "bold",
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

export default HallBookingChartComponent;
