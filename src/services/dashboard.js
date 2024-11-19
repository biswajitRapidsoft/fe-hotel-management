import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllRoomListByHotelId: build.query({
      query: (payload) => ({
        url: config.apiName.roomListByHotelId,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
          dateFilterKey: payload?.dateFilterKey,
        },
      }),
      providesTags: ["getAllRoomListByHotelId"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllRoomListByHotelIdQuery } = dashboardApi;
