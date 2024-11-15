import { createApi, retry } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosClient";
import config from "../../config/config";

export const apiSlice = createApi({
  baseQuery: retry(axiosBaseQuery({ baseUrl: config.baseUrl }), {
    maxRetries: 1,
  }),
  endpoints: () => ({}),
});
