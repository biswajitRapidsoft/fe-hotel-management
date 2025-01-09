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

    createMasterDiningType: build.mutation({
      query: (payload) => ({
        url: config.apiName.createMasterDiningType,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllMasterDiningType"],
    }),
    addFoodItems: build.mutation({
      query: (payload) => ({
        url: config.apiName.addFoodItems,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllMasterDiningType"],
    }),
    getAllMasterDiningType: build.query({
      query: (payload) => ({
        url: config.apiName.getAllMasterDiningType,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getAllMasterDiningType"],
    }),
    getFoodType: build.query({
      query: () => ({
        url: config.apiName.getFoodType,
        method: "GET",
      }),
      providesTags: ["getFoodType"],
    }),
    //GUEST DASHBOARD
    getParkingDataForGuest: build.query({
      query: (payload) => ({
        url: config.apiName.getParkingDataForGuest,
        method: "GET",
        params: {
          vehicleNo: payload,
        },
      }),
    }),

    getAllHotels: build.query({
      query: (payload) => ({
        url: config.apiName.getAllHotels,
        method: "GET",
        params: {
          hotelId: payload.hotelId,
          roomTypeId: payload.roomTypeId,
          priceRange: payload.priceRange,
        },
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
      invalidatesTags: ["getAllBookingDetails", "roomBookingHistoryByHotelId"],
    }),
    getUserDetailsForBooking: build.query({
      query: (payload) => ({
        url: config.apiName.getUserDetailsForBooking,
        method: "GET",
        params: {
          details: payload,
        },
      }),
      providesTags: ["getUserDetailsForBooking"],
    }),
    getAllRestaurantPromocodeByHotelId: build.query({
      query: (payload) => ({
        url: config.apiName.getAllRestaurantPromocodeByHotelId,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
        },
      }),
      providesTags: ["getAllRestaurantPromocodeByHotelId"],
    }),
    getAllFiltersData: build.query({
      query: () => ({
        url: config.apiName.getAllFiltersData,
        method: "GET",
      }),
    }),
    addRating: build.mutation({
      query: (payload) => ({
        url: config.apiName.addRating,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllBookingDetails"],
    }),
    makePayment: build.mutation({
      query: (payload) => ({
        url: config.apiName.makePayment,
        method: "POST",
        data: payload,
      }),
    }),
    makePartialPayment: build.mutation({
      query: (payload) => ({
        url: config.apiName.makePartialPayment,
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
          userId: payload.userId,
          // ...(payload.isService !== undefined && {
          serviceType: payload.serviceType,
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
    laundryRequest: build.mutation({
      query: (payload) => ({
        url: config.apiName.laundryRequest,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllLaundryHistory"],
    }),
    getAllLaundryHistory: build.query({
      query: (payload) => ({
        url: config.apiName.getAllLaundryHistory,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
          pageNo: payload?.pageNo,
          pageSize: payload?.pageSize,
          bookingRefNo: payload?.bookingRefNo,
          assignedPerson: payload?.assignedPerson,
        },
      }),
      providesTags: ["getAllLaundryHistory"],
    }),

    getAllLaundryStatus: build.query({
      query: () => ({
        url: config.apiName.getAllLaundryStatus,
        method: "GET",
      }),
      providesTags: ["getAllLaundryStatus"],
    }),

    changeLaundryStatus: build.mutation({
      query: (payload) => ({
        url: config.apiName.changeLaundryStatus,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllLaundryHistory"],
    }),
    addRatingForLaundry: build.mutation({
      query: (payload) => ({
        url: config.apiName.addRatingForLaundry,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllLaundryHistory"],
    }),
    getAllCleaningServiceRequestHistory: build.query({
      query: (payload) => ({
        url: config.apiName.getAllCleaningServiceRequestHistory,
        method: "GET",
        params: {
          userId: payload?.userId,
          pageNo: payload?.pageNo,
          pageSize: payload?.pageSize,
        },
      }),
      providesTags: ["getAllCleaningServiceRequestHistory"],
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
        "getAllBookingDetails",
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
      invalidatesTags: [
        "getPendingBookingRequestCounts",
        "getAllBookingDetails",
        "getAllRoomListByHotelId",
      ],
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
    bookingByFrontDeskStaff: build.mutation({
      query: (payload) => ({
        url: config?.apiName.bookingByFrontDeskStaff,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [
        "getAllRoomListByHotelId",
        "getTodayCheckoutRoomsByHotelId",
        "roomBookingHistoryByHotelId",
      ],
    }),
    getPendingBookingRequestCounts: build.query({
      query: (payload) => ({
        url: config.apiName.getPendingBookingRequestCounts,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
        },
      }),
      providesTags: ["getPendingBookingRequestCounts"],
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
  useGetUserDetailsForBookingQuery,
  useBookingByFrontDeskStaffMutation,
  useGetAllLaundryHistoryQuery,
  useLaundryRequestMutation,
  useGetAllLaundryStatusQuery,
  useChangeLaundryStatusMutation,
  useAddRatingForLaundryMutation,
  useGetPendingBookingRequestCountsQuery,
  useGetAllRestaurantPromocodeByHotelIdQuery,
  useGetAllFiltersDataQuery,
  useAddRatingMutation,
  useMakePaymentMutation,
  useMakePartialPaymentMutation,
  useLazyGetParkingDataForGuestQuery,
  useGetAllCleaningServiceRequestHistoryQuery,
  useCreateMasterDiningTypeMutation,
  useGetAllMasterDiningTypeQuery,
  useAddFoodItemsMutation,
  useGetFoodTypeQuery,
} = dashboardApi;
