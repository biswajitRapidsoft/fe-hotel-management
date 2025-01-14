import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllInventoryItemsByHotelId: build.query({
      query: (payload) => ({
        url: config.apiName.getAllInventoryItemsByHotelId,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getAllInventoryItemsByHotelId"],
    }),
    updateInventoryStock: build.mutation({
      query: (payload) => ({
        url: config.apiName.updateInventoryStock,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [
        "getAllInventoryItemsByHotelId",
        "getInventoryUpdateTrail",
      ],
    }),
    getInventoryUpdateTrail: build.query({
      query: (payload) => ({
        url: config.apiName.getInventoryUpdateTrail,
        method: "GET",
        params: {
          itemId: payload,
        },
      }),
      providesTags: ["getInventoryUpdateTrail"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllInventoryItemsByHotelIdQuery,
  useUpdateInventoryStockMutation,
  useGetInventoryUpdateTrailQuery,
} = inventoryApi;
