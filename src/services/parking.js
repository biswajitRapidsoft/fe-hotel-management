import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const parkingApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllParkingVehicleType: build.query({
      query: () => ({
        url: config.apiName.getAllParkingVehicleType,
        method: "GET",
      }),
    }),
    createParkingArea: build.mutation({
      query: (payload) => ({
        url: config.apiName.createParkingArea,
        method: "POST",
        data: payload,
      }),
    }),
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
    checkVehicleParkingStatus: build.mutation({
      query: (payload) => ({
        url: config.apiName.checkVehicleParkingStatus,
        method: "POST",
        data: payload,
      }),
      // invalidatesTags: ["getAllParkingData"],
    }),
  }),
});

export const {
  useCreateParkingAreaMutation,
  useGetAllParkingVehicleTypeQuery,
  useGetAllParkingDataQuery,
  useParkVehicleMutation,
  useReleaseVehicleMutation,
  useCheckVehicleParkingStatusMutation,
} = parkingApi;
