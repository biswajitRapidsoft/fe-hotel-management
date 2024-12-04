import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const parkingApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllParkingData: build.query({
      query: (payload) => ({
        url: config.apiName.getAllParkingData,
        method: "GET",
        // params: {
        //   hotelId: payload,
        // },
        params: {
          hotelId: payload.hotelId,
          searchKey: payload.searchVehicle || "",
        },
      }),
      providesTags: ["getAllParkingData"],
    }),
    parkVehicle: build.mutation({
      query: (payload) => ({
        url: config.apiName.parkVehicle,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllParkingData"],
    }),
    releaseVehicle: build.mutation({
      query: (payload) => ({
        url: config.apiName.releaseVehicle,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllParkingData"],
    }),
  }),
});

export const {
  useGetAllParkingDataQuery,
  useParkVehicleMutation,
  useReleaseVehicleMutation,
} = parkingApi;
