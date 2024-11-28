import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    // SUPER ADMIN DASHBOARD
    getMasterDataList: build.query({
      query: (payload) => ({
        url: config.apiName.getMasterDataList,
        method: "GET",
        params: {
          companyId: payload,
        },
      }),
      providesTags: ["getMasterDataList"],
    }),
    //GUEST DASHBOARD
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
      invalidatesTags: ["getAllBookingDetails"],
    }),
    getAllBookingDetails: build.query({
      query: (payload) => ({
        url: config.apiName.getAllBookingDetails,
        method: "GET",
        params: {
          phoneNumber: payload,
        },
      }),
      providesTags: ["getAllBookingDetails"],
    }),
    cancelHotelRoom: build.mutation({
      query: (payload) => ({
        url: config.apiName.cancelHotelRoom,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllBookingDetails"],
    }),

    // HOUSE-KEEPER DASHBOARD
    getServiceableRoomData: build.query({
      query: (payload) => ({
        url: config.apiName.getServiceableRoomData,
        method: "GET",
        // params: {
        //   hotelId: payload,
        // },
        params: {
          hotelId: payload.hotelId,
          // ...(payload.isService !== undefined && {
          isService: payload.isService,
          // }),
        },
      }),
      providesTags: ["getServiceableRoomData"],
    }),
    approveHouseKeepingService: build.mutation({
      query: (payload) => ({
        url: config.apiName.approveHouseKeepingService,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getServiceableRoomData"],
    }),

    // FRONT-DESK DASHBOARD
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
    getAllGovtIds: build.query({
      query: () => ({
        url: config.apiName.getAllGovtIds,
        method: "GET",
      }),
      providesTags: ["getAllGovtIds"],
    }),
    getAllPaymentMethods: build.query({
      query: () => ({
        url: config?.apiName?.getAllPaymentMethods,
        method: "GET",
      }),
      providesTags: ["getAllPaymentMethods"],
    }),
    saveCustomerCheckIn: build.mutation({
      query: (payload) => ({
        url: config?.apiName.saveCustomerCheckIn,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [
        "getAllRoomListByHotelId",
        "getTodayCheckoutRoomsByHotelId",
        "roomBookingHistoryByHotelId",
      ],
    }),
    getTodayCheckoutRoomsByHotelId: build.query({
      query: (payload) => ({
        url: config.apiName.getTodayCheckoutRoomsByHotelId,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
        },
      }),
      providesTags: ["getTodayCheckoutRoomsByHotelId"],
    }),
    requestRoomCheckout: build.mutation({
      query: (payload) => ({
        url: config?.apiName.requestRoomCheckout,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [
        "getAllRoomListByHotelId",
        "roomBookingHistoryByHotelId",
      ],
    }),
    finalRoomCheckOut: build.mutation({
      query: (payload) => ({
        url: config?.apiName.finalRoomCheckOut,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [
        "getAllRoomListByHotelId",
        "getTodayCheckoutRoomsByHotelId",
      ],
    }),
    roomCleanRequest: build.mutation({
      query: (payload) => ({
        url: config?.apiName.roomCleanRequest,
        method: "POST",
        data: payload,
      }),
    }),
    roomtypeByHotelId: build.query({
      query: (payload) => ({
        url: config.apiName.roomtypeByHotelId,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
        },
      }),
      providesTags: ["roomtypeByHotelId"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetMasterDataListQuery,
  useGetAllRoomListByHotelIdQuery,
  useGetAllHotelsQuery,
  useReserveHotelRoomMutation,
  useGetAllBookingDetailsQuery,
  useCancelHotelRoomMutation,
  useGetAllGovtIdsQuery,
  useGetAllPaymentMethodsQuery,
  useSaveCustomerCheckInMutation,
  useGetTodayCheckoutRoomsByHotelIdQuery,
  useRequestRoomCheckoutMutation,
  useGetServiceableRoomDataQuery,
  useApproveHouseKeepingServiceMutation,
  useFinalRoomCheckOutMutation,
  useRoomCleanRequestMutation,
  useRoomtypeByHotelIdQuery,
} = dashboardApi;
