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
      invalidatesTags: ["roomBookingHistoryByHotelId"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useRoomBookingHistoryByHotelIdQuery,
  useGetAllBookingStatusTypeQuery,
  useConFirmBookingMutation,
} = frontdeskBookingHistoryApi;
