import { apiSlice } from "../app/api/apiSlice";
import config from "../config/config";

const loginApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (payload) => ({
        url:
          payload.password === null
            ? config.apiName.loginAsGuest
            : config.apiName.loginAsCustomer,
        method: "POST",
        data: payload,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = loginApi;
