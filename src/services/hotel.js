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
    addBanquet: build.mutation({
      query: (payload) => ({
        url: config.apiName.addBanquet,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllBanquet"],
    }),
    getAllBanquet: build.query({
      query: (payload) => ({
        url: config.apiName.getAllBanquet,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getAllBanquet"],
    }),
    getAllPromoCode: build.query({
      query: (payload) => ({
        url: config.apiName.getAllPromoCode,
        method: "GET",
        params: {
          hotelId: payload,
        },
      }),
      providesTags: ["getAllPromoCode"],
    }),
    createPromoCode: build.mutation({
      query: (payload) => ({
        url: config.apiName.createPromocode,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllPromoCode"],
    }),
    getAllPromocodeTypes: build.query({
      query: (payload) => ({
        url: config.apiName.getAllPromocodeTypes,
        method: "GET",
      }),
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
  useAddBanquetMutation,
  useGetAllBanquetQuery,
  useGetAllPromoCodeQuery,
  useCreatePromoCodeMutation,
  useGetAllPromocodeTypesQuery,
} = hotelApi;
