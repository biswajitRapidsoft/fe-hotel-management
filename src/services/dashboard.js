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
    getAllHotels: build.query({
      query: () => ({
        url: config.apiName.getAllHotels,
        method: "GET",
      }),
    }),
    reserveHotelRoom: build.mutation({
      query: (payload) => ({
        url: config.apiName.reserveHotelRoom,
        method: "POST",
        data: payload,
      }),
    }),
    getAllBookingDetails: build.query({
      query: (payload) => ({
        url: config.apiName.getAllBookingDetails,
        method: "GET",
        params: {
          phoneNumber: payload,
        },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllRoomListByHotelIdQuery,
  useGetAllHotelsQuery,
  useReserveHotelRoomMutation,
  useGetAllBookingDetailsQuery,
} = dashboardApi;
