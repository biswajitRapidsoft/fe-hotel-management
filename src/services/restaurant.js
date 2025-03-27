import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const restaurantApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllFood: build.query({
      query: (payload) => ({
        url: config.apiName.getAllFood,
        method: "GET",
        params: {
          hotelId: payload.hotelId,
          itemName: payload.itemName,
        },
      }),
    }),
    orderFood: build.mutation({
      query: (payload) => ({
        url: config.apiName.orderFood,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [
        "getCustomerOrdeHistory",
        "getAllTablesForCounter",
        "getAllTablesForWaiter",
      ],
    }),
    getDineType: build.query({
      query: () => ({
        url: config.apiName.getDineType,
        method: "GET",
      }),
    }),
    getCustomerOrdeHistory: build.query({
      query: (payload) => ({
        url: config.apiName.getCustomerOrdeHistory,
        method: "GET",
        params: {
          refId: payload,
        },
      }),
      providesTags: ["getCustomerOrdeHistory"],
    }),

    updateFoodOrderStatus: build.mutation({
      query: (payload) => ({
        url: config.apiName.updateFoodOrderStatus,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getCustomerOrdeHistory", "getFoodOrderListAdmin"],
    }),
    getFoodOrderListAdmin: build.query({
      query: (payload) => ({
        url: config.apiName.getFoodOrderListAdmin,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getFoodOrderListAdmin"],
    }),
    getAllFoodOrderStatus: build.query({
      query: () => ({
        url: config.apiName.getAllFoodOrderStatus,
        method: "GET",
      }),
    }),
    rateFood: build.mutation({
      query: (payload) => ({
        url: config.apiName.rateFood,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getCustomerOrdeHistory"],
    }),
    getAllTablesForWaiter: build.query({
      query: (payload) => ({
        url: config.apiName.getAllTablesForWaiter,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
          userId: payload?.userId,
        },
      }),
      providesTags: ["getAllTablesForWaiter"],
    }),
    deliverFoodByWaiter: build.mutation({
      query: (payload) => ({
        url: config.apiName.deliverFoodByWaiter,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllTablesForWaiter"],
    }),
    getAllTablesForCounter: build.query({
      query: (payload) => ({
        url: config.apiName.getAllTablesForCounterStaff,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
          userId: payload?.userId,
        },
      }),
      providesTags: ["getAllTablesForCounter"],
    }),
    getBookingDetailsFromRoomNumber: build.mutation({
      query: (payload) => ({
        url: config.apiName.getBookingDetailsByRoomNumber,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllTablesForCounter"],
    }),
    assosciateOrderWithRoom: build.mutation({
      query: (payload) => ({
        url: config.apiName.assosciateOrderWithRoom,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [
        "getAllDineInRequestFromRoom",
        "getAllTodayOrderForCounterStaff",
      ],
    }),
    completeFoodOrder: build.mutation({
      query: (payload) => ({
        url: config.apiName.completeFoodOrder,
        method: "POST",
        data: payload,
      }),
    }),
    getAllDineInRequestFromRoom: build.query({
      query: (payload) => ({
        url: config.apiName.getAllDineInRequestFromRoom,
        method: "GET",
        params: {
          hotelId: payload.hotelId,
          date: payload.date,
        },
      }),
      providesTags: ["getAllDineInRequestFromRoom"],
    }),
    getAllWaiters: build.query({
      query: (payload) => ({
        url: config.apiName.getAllWaiters,
        method: "GET",
        params: {
          hotelId: payload.hotelId,
        },
      }),
      providesTags: ["getAllWaiters"],
    }),
    assignTableToWaiter: build.mutation({
      query: (payload) => ({
        url: config.apiName.assignTableToWaiter,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [
        "getAllDineInRequestFromRoom",
        "getAllTablesForCounter",
      ],
    }),
    getAllKitchenStaff: build.query({
      query: (payload) => ({
        url: config.apiName.getAllKitchenStaff,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
        },
      }),
      providesTags: ["getAllKitchenStaff"],
    }),
    assignServiceStaff: build.mutation({
      query: (payload) => ({
        url: config.apiName.assignKitchenStaff,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [
        "getAllDineInRequestFromRoom",
        "getAllTodayOrderForCounterStaff",
      ],
    }),
    getAllOrderRequestForServiceStaff: build.query({
      query: (payload) => ({
        url: config.apiName.getAllOrderRequestForServiceStaff,
        method: "GET",
        params: {
          userId: payload?.userId,
        },
      }),
      providesTags: ["getAllOrderRequestForServiceStaff"],
    }),
    deliverFoodByKitchenServiceStaff: build.mutation({
      query: (payload) => ({
        url: config.apiName.deliverFoodByKitchenServiceStaff,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllOrderRequestForServiceStaff"],
    }),
    getAllTodayOrderForCounterStaff: build.query({
      query: (payload) => ({
        url: config.apiName.getAllTodayOrderForCounterStaff,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getAllTodayOrderForCounterStaff"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllFoodQuery,
  useOrderFoodMutation,
  useGetDineTypeQuery,
  useGetCustomerOrdeHistoryQuery,
  useUpdateFoodOrderStatusMutation,
  useGetFoodOrderListAdminQuery,
  useGetAllFoodOrderStatusQuery,
  useRateFoodMutation,
  useGetAllTablesForWaiterQuery,
  useDeliverFoodByWaiterMutation,
  useGetAllTablesForCounterQuery,
  useGetBookingDetailsFromRoomNumberMutation,
  useAssosciateOrderWithRoomMutation,
  useCompleteFoodOrderMutation,
  useGetAllDineInRequestFromRoomQuery,
  useGetAllWaitersQuery,
  useAssignTableToWaiterMutation,
  useGetAllKitchenStaffQuery,
  useAssignServiceStaffMutation,
  useGetAllOrderRequestForServiceStaffQuery,
  useDeliverFoodByKitchenServiceStaffMutation,
  useGetAllTodayOrderForCounterStaffQuery,
} = restaurantApi;
