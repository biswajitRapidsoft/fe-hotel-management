import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const restaurantApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllFood: build.query({
      query: (payload) => ({
        url: config.apiName.getAllFood,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
    }),
    orderFood: build.mutation({
      query: (payload) => ({
        url: config.apiName.orderFood,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getCustomerOrdeHistory"],
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
      invalidatesTags: ["getCustomerOrdeHistory"],
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
} = restaurantApi;
