import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const hotelApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getStateList: build.query({
      query: () => ({
        url: config.apiName.getAllState,
        method: "GET",
      }),
    }),
    getCityList: build.query({
      query: (payload) => ({
        url: `${config.apiName.getAllCity}/${payload}`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetStateListQuery, useGetCityListQuery } = hotelApi;
