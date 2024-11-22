import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const roomTypeApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllRoomTypesByCompany: build.query({
      query: (payload) => ({
        url: config.apiName.getAllRoomTypesByCompany,
        method: "GET",
        params: {
          companyId: payload,
        },
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllRoomTypesByCompanyQuery } = roomTypeApi;
