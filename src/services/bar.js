import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const barApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllBarItemList: build.query({
      query: (payload) => ({
        url: config.apiName.getAllBarItemList,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getAllBarItemList"],
    }),
    getBarPromoCodeList: build.query({
      query: (payload) => ({
        url: config.apiName.getBarPromoCodeList,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
    }),
    orderFromBar: build.mutation({
      query: (payload) => ({
        url: config.apiName.orderFromBar,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["barOrderHistory", "getAllBarItemList"],
    }),
    barOrderHistory: build.query({
      query: (payload) => ({
        url: config.apiName.barOrderHistory,
        method: "GET",
        params: {
          bookingRefId: payload,
        },
      }),
      providesTags: ["barOrderHistory"],
    }),
    changeBarOrderStatus: build.mutation({
      query: (payload) => ({
        url: config.apiName.changeBarOrderStatus,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["barOrderHistory", "getBarOrderHistoryAdmin"],
    }),
    getBarOrderHistoryAdmin: build.query({
      query: (payload) => ({
        url: config.apiName.getBarOrderHistoryAdmin,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getBarOrderHistoryAdmin"],
    }),
    getAllBarOrderStatus: build.query({
      query: () => ({
        url: config.apiName.getAllBarOrderStatus,
        method: "GET",
      }),
    }),
    rateBeer: build.mutation({
      query: (payload) => ({
        url: config.apiName.rateBeer,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["barOrderHistory", "getAllBarItemList"],
    }),
    getAllTablesForBarWaiter: build.query({
      query: (payload) => ({
        url: config.apiName.getAllTablesForBarWaiter,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
          userId: payload?.userId,
        },
      }),
      providesTags: ["getAllTablesForBarWaiter"],
    }),
    deliverBarByWaiter: build.mutation({
      query: (payload) => ({
        url: config.apiName.deliverBarByWaiter,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllTablesForBarWaiter"],
    }),
    assosciateBarOrderWithRoom: build.mutation({
      query: (payload) => ({
        url: config.apiName.assosciateBarOrderWithRoom,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllTablesForBarWaiter"],
    }),
    completeBarOrder: build.mutation({
      query: (payload) => ({
        url: config.apiName.completeBarOrder,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllTablesForBarWaiter"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllBarItemListQuery,
  useGetBarPromoCodeListQuery,
  useOrderFromBarMutation,
  useBarOrderHistoryQuery,
  useChangeBarOrderStatusMutation,
  useGetBarOrderHistoryAdminQuery,
  useGetAllBarOrderStatusQuery,
  useRateBeerMutation,
  useGetAllTablesForBarWaiterQuery,
  useDeliverBarByWaiterMutation,
  useAssosciateBarOrderWithRoomMutation,
  useCompleteBarOrderMutation,
} = barApi;
