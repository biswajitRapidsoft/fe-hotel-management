import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const roomTypeApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllRoomTypesByCompany: build.query({
      query: (payload) => ({
        url: config.apiName.getAllRoomTypesByCompany,
        method: "GET",
        params: {
          companyId: payload,
        },
      }),
      providesTags: ["getAllRoomTypesByCompany"],
    }),
    addRoomType: build.mutation({
      query: (payload) => ({
        url: config.apiName.addRoomType,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllRoomTypesByCompany"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllRoomTypesByCompanyQuery, useAddRoomTypeMutation } =
  roomTypeApi;
