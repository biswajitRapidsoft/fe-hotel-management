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
      providesTags: ["getAllExtraItems"],
    }),
    addExtraItem: build.mutation({
      query: (payload) => ({
        url: config.apiName.addExtraItem,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllExtraItems"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllExtraItemsQuery, useAddExtraItemMutation } =
  extraItemApi;
