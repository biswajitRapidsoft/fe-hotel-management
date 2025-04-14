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
      invalidatesTags: ["getAllSpaType", "getHotelListByCompany"],
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
          pageNo: payload.pageNo,
          pageSize: payload.pageSize,
          hotelId: payload.hotelId,
          fromData: payload.fromDate,
          toDate: payload.toDate,
        },
      }),
      providesTags: ["getSpaBookingHistoryAdmin"],
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
    getSpaBookingStatusType: build.query({
      query: () => ({
        url: config.apiName.getSpaBookingStatusType,
        method: "GET",
      }),
    }),
    updateSpaBookingStatus: build.mutation({
      query: (payload) => ({
        url: config.apiName.updateSpaBookingStatus,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getSpaBookingHistoryAdmin"],
    }),
    rateSpa: build.mutation({
      query: (payload) => ({
        url: config.apiName.rateSpa,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getSpaBookingHistoryGuest"],
    }),
    getAllTherapistByHotelId: build.query({
      query: (payload) => ({
        url: config.apiName.getAllTherapistByHotelId,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getAllTherapistByHotelId"],
    }),
    saveSpaRoom: build.mutation({
      query: (payload) => ({
        url: config.apiName.saveSpaRoom,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getSpaRooms"],
    }),
    getSpaRooms: build.query({
      query: (payload) => ({
        url: config.apiName.getSpaRooms,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getSpaRooms"],
    }),
    getSpaTypeReceptionist: build.query({
      query: (payload) => ({
        url: config.apiName.getSpaTypeReceptionist,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getSpaTypeReceptionist"],
    }),
    getRoomBySpaTypeReceptionist: build.query({
      query: (payload) => ({
        url: config.apiName.getRoomBySpaTypeReceptionist,
        method: "GET",
        params: {
          spaTypeId: payload.spaTypeId,
          startTime: payload.startTime,
          endTime: payload.endTime,
          hotelId: payload.hotelId,
        },
      }),
      providesTags: ["getRoomBySpaTypeReceptionist"],
    }),
    bookSpaByReceptionist: build.mutation({
      query: (payload) => ({
        url: config.apiName.bookSpaByReceptionist,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getSpaBookingReceptionist"],
    }),
    getSpaBookingReceptionist: build.query({
      query: (payload) => ({
        url: config.apiName.getSpaBookingReceptionist,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getSpaBookingReceptionist"],
    }),
    updateSpaBooking: build.mutation({
      query: (payload) => ({
        url: config.apiName.updateSpaBooking,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getSpaBookingReceptionist"],
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
  useGetSpaBookingStatusTypeQuery,
  useUpdateSpaBookingStatusMutation,
  useRateSpaMutation,
  useGetAllTherapistByHotelIdQuery,
  useSaveSpaRoomMutation,
  useGetSpaRoomsQuery,
  useGetSpaTypeReceptionistQuery,
  useGetRoomBySpaTypeReceptionistQuery,
  useBookSpaByReceptionistMutation,
  useGetSpaBookingReceptionistQuery,
  useUpdateSpaBookingMutation,
} = spaApi;
