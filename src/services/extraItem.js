import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const extraItemApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllExtraItems: build.query({
      query: (payload) => ({
        url: config.apiName.getAllExtraItems,
        method: "GET",
        params: {
          companyId: payload,
        },
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllExtraItemsQuery } = extraItemApi;
