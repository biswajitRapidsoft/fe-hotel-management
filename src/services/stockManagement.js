import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const stockManagementApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllBarItemsByHotelId: build.query({
      query: (payload) => ({
        url: config.apiName.getBarItemsStock,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getAllBarItemsByHotelId"],
    }),
    updateBarInventoryStock: build.mutation({
      query: (payload) => ({
        url: config.apiName.updateBarItemsStock,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllBarItemsByHotelId"],
    }),
  }),
});

export const {
  useGetAllBarItemsByHotelIdQuery,
  useUpdateBarInventoryStockMutation,
} = stockManagementApi;
