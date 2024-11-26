import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
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
        params: {
          hotelId: payload,
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
      invalidatesTags: ["getAllRoomListByHotelId"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAllRoomListByHotelIdQuery,
  useGetAllHotelsQuery,
  useReserveHotelRoomMutation,
  useGetAllBookingDetailsQuery,
  useCancelHotelRoomMutation,
  useGetAllGovtIdsQuery,
  useGetAllPaymentMethodsQuery,
  useSaveCustomerCheckInMutation,
  useGetServiceableRoomDataQuery,
  useApproveHouseKeepingServiceMutation,
} = dashboardApi;
