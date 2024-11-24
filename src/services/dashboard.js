import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllRoomListByHotelId: build.query({
      query: (payload) => ({
        url: config.apiName.getAllRoomListByHotelId,
        method: "GET",
        params: {
          hotelId: payload?.hotelId,
          dateFilterKey: payload?.dateFilterKey,
        },
      }),
      providesTags: ["getAllRoomListByHotelId"],
    }),
    getAllHotels: build.query({
      query: () => ({
        url: config.apiName.getAllHotels,
        method: "GET",
      }),
    }),
    getAllGovtIds: build.query({
      query: () => ({
        url: config.apiName.getAllGovtIds,
        method: "GET",
      }),
      providesTags: ["getAllGovtIds"],
    }),
    getAllPaymentMethods: build.query({
      query: () => ({
        url: config?.apiName?.getAllPaymentMethods,
        method: "GET",
      }),
      providesTags: ["getAllPaymentMethods"],
    }),
    saveCustomerCheckIn: build.mutation({
      query: (payload) => ({
        url: config?.apiName.saveCustomerCheckIn,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllRoomListByHotelId"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAllRoomListByHotelIdQuery,
  useGetAllHotelsQuery,
  useGetAllGovtIdsQuery,
  useGetAllPaymentMethodsQuery,
  useSaveCustomerCheckInMutation,
} = dashboardApi;
