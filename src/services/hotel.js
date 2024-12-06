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

    uploadFile: build.mutation({
      query: (payload) => ({
        url: config.apiName.fileUpload,
        method: "POST",
        data: payload,
      }),
    }),

    addHotel: build.mutation({
      query: (payload) => ({
        url: config.apiName.addHotel,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getHotelListByCompany"],
    }),

    getHotelListByCompany: build.query({
      query: (payload) => ({
        url: config.apiName.getHotelListByCompany,
        method: "GET",
        params: {
          companyId: payload,
        },
      }),
      providesTags: ["getHotelListByCompany"],
    }),
    addHall: build.mutation({
      query: (payload) => ({
        url: config.apiName.addHall,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllHalls"],
    }),
    getAllHalls: build.query({
      query: (payload) => ({
        url: config.apiName.getAllHalls,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getAllHalls"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStateListQuery,
  useGetCityListQuery,
  useUploadFileMutation,
  useAddHotelMutation,
  useGetHotelListByCompanyQuery,
  useAddHallMutation,
  useGetAllHallsQuery,
} = hotelApi;
