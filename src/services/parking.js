import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const parkingApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllParkingData: build.query({
      query: (payload) => ({
        url: config.apiName.getAllParkingData,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getAllParkingData"],
    }),
  }),
});

export const { useGetAllParkingDataQuery } = parkingApi;
