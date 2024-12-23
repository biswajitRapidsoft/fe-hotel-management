import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const spaApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    saveSpaType: build.mutation({
      query: (payload) => ({
        url: config.apiName.saveSpaType,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllSpaType"],
    }),
    getAllSpaType: build.query({
      query: (payload) => ({
        url: config.apiName.getAllSpaType,
        method: "GET",
        params: {
          hotelId: payload.hotelId,
          isActive: payload.isActive,
        },
      }),
      providesTags: ["getAllSpaType"],
    }),
    getAllSpaTypeGuest: build.query({
      query: (payload) => ({
        url: config.apiName.getAllSpaTypeGuest,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
    }),
    getSpaSlots: build.query({
      query: (payload) => ({
        url: config.apiName.getSpaSlots,
        method: "GET",
        params: {
          spaTypeId: payload.spaTypeId,
          shiftType: payload.shiftType,
          date: payload.date,
        },
      }),
      providesTags: ["getSpaSlots"],
    }),
    bookSpa: build.mutation({
      query: (payload) => ({
        url: config.apiName.bookSpa,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getSpaSlots", "getSpaBookingHistoryGuest"],
    }),
    getSpaBookingHistoryAdmin: build.query({
      query: (payload) => ({
        url: config.apiName.getSpaBookingHistoryAdmin,
        method: "GET",
        params: {
          pageNo: 0,
          pageSize: 0,
          hotelId: payload.hotelId,
          fromData: null,
          toDate: null,
        },
      }),
    }),
    getSpaBookingHistoryGuest: build.query({
      query: (payload) => ({
        url: config.apiName.getSpaBookingHistoryGuest,
        method: "GET",
        params: {
          refNo: payload,
        },
      }),
      providesTags: ["getSpaBookingHistoryGuest"],
    }),
    cancelBookingForSpa: build.mutation({
      query: (payload) => ({
        url: config.apiName.cancelBookingForSpa,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getSpaBookingHistoryGuest", "getSpaSlots"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSaveSpaTypeMutation,
  useGetAllSpaTypeQuery,
  useGetAllSpaTypeGuestQuery,
  useGetSpaSlotsQuery,
  useBookSpaMutation,
  useGetSpaBookingHistoryAdminQuery,
  useGetSpaBookingHistoryGuestQuery,
  useCancelBookingForSpaMutation,
} = spaApi;
