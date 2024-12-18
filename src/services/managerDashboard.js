// getAllDashboardDataForManager

import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const managerDashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllDashboardDataForManager: build.query({
      query: (payload) => ({
        url: config.apiName.getAllDashboardDataForManager,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
    }),
  }),
});

export const { useGetAllDashboardDataForManagerQuery } = managerDashboardApi;
