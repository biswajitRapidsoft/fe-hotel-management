import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const loginApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (payload) => ({
        url:
          payload.password === null
            ? config.apiName.loginAsCustomer
            : config.apiName.loginAsStaff,
        method: "POST",
        data: payload,
      }),
    }),
    changePassword: build.mutation({
      query: (payload) => ({
        url: config.apiName.changePassword,
        method: "POST",
        data: payload,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useChangePasswordMutation } = loginApi;
