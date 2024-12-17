import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const houseKeepingHistoryApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllRoomServiceHistory: build.query({
      query: (payload) => ({
        url: config.apiName.getAllRoomServiceHistory,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
          pageNo: payload?.pageNo,
          pageSize: payload?.pageSize,
          serviceType: payload?.serviceType,
          serviceRequestStatus: payload?.serviceRequestStatus,
        },
      }),
      providesTags: ["getAllRoomServiceHistory"],
    }),
    getAllHouseKeepingStaff: build.query({
      query: (payload) => ({
        url: config.apiName.getAllHouseKeepingStaff,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
        },
      }),
      providesTags: ["getAllHouseKeepingStaff"],
    }),
    assignHouseKeepingRequest: build.mutation({
      query: (payload) => ({
        url: config.apiName.assignHouseKeepingRequest,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [
        "getAllRoomServiceHistory",
        "getAllHouseKeepingStaff",
        "roomBookingHistoryByHotelId",
        "getRoomBookingChart",
      ],
    }),
    exportHouseKeepingRecords: build.mutation({
      query: (payload) => ({
        url: config.apiName.exportHouseKeepingRecords,
        method: "POST",
        data: payload,
        responseType: "blob",
      }),
    }),

    getAllHouseKeepingServiceRequestStatuses: build.query({
      query: () => ({
        url: config.apiName.getAllHouseKeepingServiceRequestStatuses,
        method: "GET",
      }),
    }),

    getAllHouseKeepingServiceTypes: build.query({
      query: () => ({
        url: config.apiName.getAllHouseKeepingServiceTypes,
        method: "GET",
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAllRoomServiceHistoryQuery,
  useGetAllHouseKeepingStaffQuery,
  useAssignHouseKeepingRequestMutation,
  useExportHouseKeepingRecordsMutation,
  useGetAllHouseKeepingServiceRequestStatusesQuery,
  useGetAllHouseKeepingServiceTypesQuery,
} = houseKeepingHistoryApi;
