import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllRoomListByHotelId: build.query({
      query: (payload) => ({
        url: config.apiName.getAllRoomListByHotelId,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
          dateFilterKey: payload?.dateFilterKey,
        },
      }),
      providesTags: ["getAllRoomListByHotelId"],
    }),
    getAllHotels: build.query({
      query: () => ({
        url: config.apiName.getAllHotels,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllRoomListByHotelIdQuery, useGetAllHotelsQuery } =
  dashboardApi;
