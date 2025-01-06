import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const hallBookingDashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllHallBookings: build.query({
      query: (payload) => ({
        url: config.apiName.getAllHallBookings,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
          pageNo: payload?.pageNo,
          pageSize: payload?.pageSize,
          status: payload?.status || null,
          isForLiveEvents: payload?.isForLiveEvents || false,
          isForTodayEvents: payload?.isForTodayEvents || false,
          isForFutureEvents: payload?.isForFutureEvents || false,
          isForExpiredEvents: payload?.isForExpiredEvents || false,
          capacity: payload?.capacity || null,
        },
      }),
      providesTags: ["getAllHallBookings"],
    }),
    getAllHallStatus: build.query({
      query: () => ({
        url: config.apiName.getAllHallStatus,
        method: "GET",
      }),
    }),
    getAllHallsByHotelIdForHallBooking: build.query({
      query: (payload) => ({
        url: config.apiName.getAllHallsByHotelIdForHallBooking,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
        },
      }),
      providesTags: ["getAllHallsByHotelIdForHallBooking"],
    }),
    getHallBookingChart: build.query({
      query: (payload) => ({
        url: config.apiName.getHallBookingChart,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
        },
      }),
      providesTags: ["getHallBookingChart"],
    }),
    getIndividualHallBookingDataById: build.query({
      query: (payload) => ({
        url: config.apiName.getIndividualHallBookingDataById,
        method: "GET",
        params: {
          id: payload?.id,
        },
      }),
      providesTags: ["getIndividualHallBookingDataById"],
    }),
    bookHallFromFrontdesk: build.mutation({
      query: (payload) => ({
        url: config.apiName.bookHallFromFrontdesk,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllHallBookings", "getHallBookingChart"],
    }),
    getAllBanquetsByHotelId: build.query({
      query: (payload) => ({
        url: config.apiName.getAllBanquetsByHotelId,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
        },
      }),
      providesTags: ["getAllBanquetsByHotelId"],
    }),
    changeHallBookingStatus: build.mutation({
      query: (payload) => ({
        url: config.apiName.changeHallBookingStatus,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllHallBookings", "getHallBookingChart"],
    }),
    capacityFilterOptions: build.query({
      query: (payload) => ({
        url: config.apiName.capacityFilterOptions,
        method: "GET",
      }),
      providesTags: ["capacityFilterOptions"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllHallBookingsQuery,
  useGetAllHallStatusQuery,
  useGetAllHallsByHotelIdForHallBookingQuery,
  useGetHallBookingChartQuery,
  useGetIndividualHallBookingDataByIdQuery,
  useBookHallFromFrontdeskMutation,
  useGetAllBanquetsByHotelIdQuery,
  useChangeHallBookingStatusMutation,
  useCapacityFilterOptionsQuery,
} = hallBookingDashboardApi;
