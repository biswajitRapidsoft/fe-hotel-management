import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const frontdeskBookingHistoryApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    roomBookingHistoryByHotelId: build.query({
      query: (payload) => ({
        url: config.apiName.roomBookingHistoryByHotelId,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
          bookingRefNumber: payload?.bookingRefNumber,
          bookingStatus: payload?.bookingStatus,
          fromDate: payload?.fromDate,
          toDate: payload?.toDate,
          pageNo: payload?.pageNo,
          pageSize: payload?.pageSize,
        },
      }),
      providesTags: ["roomBookingHistoryByHotelId"],
    }),
    getAllBookingStatusType: build.query({
      query: () => ({
        url: config.apiName.getAllBookingStatusType,
        method: "GET",
      }),
      providesTags: ["getAllBookingStatusType"],
    }),
    conFirmBooking: build.mutation({
      query: (payload) => ({
        url: config.apiName.conFirmBooking,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["roomBookingHistoryByHotelId", "getRoomBookingChart"],
    }),
    getRoomsByRoomType: build.query({
      query: (payload) => ({
        url: config.apiName.getRoomsByRoomType,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
          roomTypeId: payload?.roomTypeId,
        },
      }),
      providesTags: ["getRoomsByRoomType"],
    }),
    getRoomBookingChart: build.query({
      query: (payload) => ({
        url: config.apiName.getRoomBookingChart,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
        },
      }),
      providesTags: ["getRoomBookingChart"],
    }),
    approveBookingCancelRequest: build.mutation({
      query: (payload) => ({
        url: config.apiName.approveBookingCancelRequest,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["roomBookingHistoryByHotelId", "getRoomBookingChart"],
    }),
    cancelRoomBookingFromBookingHistory: build.mutation({
      query: (payload) => ({
        url: config.apiName.cancelRoomBookingFromBookingHistory,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [
        "roomBookingHistoryByHotelId",
        "getRoomBookingChart",
        "getAllRoomListByHotelId",
        "getTodayCheckoutRoomsByHotelId",
        "getPendingBookingRequestCounts",
      ],
    }),
    exportBookingHistory: build.mutation({
      query: (payload) => ({
        url: config.apiName.exportBookingHistory,
        method: "POST",
        data: payload,
        responseType: "blob",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useRoomBookingHistoryByHotelIdQuery,
  useGetAllBookingStatusTypeQuery,
  useConFirmBookingMutation,
  useGetRoomsByRoomTypeQuery,
  useGetRoomBookingChartQuery,
  useApproveBookingCancelRequestMutation,
  useCancelRoomBookingFromBookingHistoryMutation,
  useExportBookingHistoryMutation,
} = frontdeskBookingHistoryApi;
