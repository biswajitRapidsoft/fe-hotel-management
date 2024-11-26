import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const usersApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllUsersByCompany: build.query({
      query: (payload) => ({
        url: config.apiName.getAllUsersByCompany,
        method: "GET",
        params: {
          companyId: payload,
        },
      }),
      providesTags: ["getAllUsersByCompany"],
    }),
    getAllRoles: build.query({
      query: () => ({
        url: config.apiName.getAllRoles,
        method: "GET",
      }),
    }),
    saveUser: build.mutation({
      query: (payload) => ({
        url: config.apiName.saveUser,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["getAllUsersByCompany"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllUsersByCompanyQuery,
  useGetAllRolesQuery,
  useSaveUserMutation,
} = usersApi;
