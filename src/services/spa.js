import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const spaApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    saveSpaType: build.mutation({
      query: (payload) => ({
        url: config.apiName.saveSpaType,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllSpaType"],
    }),
    getAllSpaType: build.query({
      query: (payload) => ({
        url: config.apiName.getAllSpaType,
        method: "GET",
        params: {
          hotelId: payload.hotelId,
          isActive: payload.isActive,
        },
      }),
      providesTags: ["getAllSpaType"],
    }),
  }),
  overrideExisting: false,
});

export const { useSaveSpaTypeMutation, useGetAllSpaTypeQuery } = spaApi;
