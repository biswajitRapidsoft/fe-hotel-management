import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const parkingApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    parkingSlotStatusChange: build.mutation({
      query: (payload) => ({
        url: config.apiName.parkingSlotStatusChange,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getParkingDataForAdmin"],
    }),
    getParkingDataForAdmin: build.query({
      query: (payload) => ({
        url: config.apiName.getParkingDataForAdmin,
        method: "GET",
        params: {
          hotelId: payload.hotelId,
          searchKey: payload.searchVehicle || "",
        },
      }),
      providesTags: ["getParkingDataForAdmin"],
    }),
    updateParkingArea: build.mutation({
      query: (payload) => ({
        url: config.apiName.updateParking,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getParkingDataForAdmin"],
    }),
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
      invalidatesTags: ["getParkingDataForAdmin", "getHotelListByCompany"],
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
    getAllParkingHistoryData: build.query({
      query: (payload) => ({
        url: config.apiName.getAllParkingHistoryData,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
          pageNo: payload?.pageNo,
          pageSize: payload?.pageSize,
        },
      }),
      providesTags: ["getAllParkingHistoryData"],
    }),
  }),
});

export const {
  useParkingSlotStatusChangeMutation,
  useGetParkingDataForAdminQuery,
  useUpdateParkingAreaMutation,
  useCreateParkingAreaMutation,
  useGetAllParkingVehicleTypeQuery,
  useGetAllParkingDataQuery,
  useParkVehicleMutation,
  useReleaseVehicleMutation,
  useCheckVehicleParkingStatusMutation,
  useGetAllParkingHistoryDataQuery,
} = parkingApi;
