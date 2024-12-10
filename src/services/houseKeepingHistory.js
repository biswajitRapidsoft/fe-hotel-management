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
      invalidatesTags: ["getAllRoomServiceHistory", "getAllHouseKeepingStaff"],
    }),
    exportHouseKeepingRecords: build.mutation({
      query: (payload) => ({
        url: config.apiName.exportHouseKeepingRecords,
        method: "POST",
        data: payload,
        responseType: "blob",
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
} = houseKeepingHistoryApi;
