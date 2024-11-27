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
  }),
  overrideExisting: false,
});

export const { useGetAllFoodQuery } = restaurantApi;
