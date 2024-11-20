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
    getAllRoomTypesByCompany: build.query({
      query: (payload) => ({
        url: config.apiName.getAllRoomTypesByCompany,
        method: "GET",
        params: {
          companyId: payload,
        },
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
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStateListQuery,
  useGetCityListQuery,
  useGetAllRoomTypesByCompanyQuery,
  useUploadFileMutation,
  useAddHotelMutation,
} = hotelApi;
