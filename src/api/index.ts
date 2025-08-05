import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const BASE_URL = `http://51.21.19.38:8000`;

const Tags = {
  Advertisements: "Advertisements",
  WIFI:"WIFI"
};

export const LIMIT = 20;

// Base query function for making requests
const baseQuery = fetchBaseQuery({
  baseUrl: `${BASE_URL}/api/v1`,
  prepareHeaders: (headers) => {
    const auth =`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODkyMmYyMGRjNTk0N2U0NjhkMmNiYTciLCJyb2xlIjoidXNlciIsImp0aSI6IjNlSHNWRFRaIiwiaWF0IjoxNzU0NDI1MzgxLCJleHAiOjE3NTcwMTczODF9.9J0xfAvVqm0PtlYprR9lJ7uQnQoBxhBcyuEwbGXmptk`;
    if (auth) {
      headers.set("Authorization", `Bearer ${auth}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [...Object.values(Tags)],
  endpoints: (builder) => ({
    addAdvertisement: builder.mutation({
      query: (body) => ({
        url: `/advertisements`,
        method: "POST",
        body,
      }),
      invalidatesTags: [Tags.Advertisements],
    }),
    getAdvertisements: builder.query({
      query: () => ({
        url: `/advertisements`,
        method: "GET",
      }),
      providesTags: [Tags.Advertisements],
    }),
    updateAdvertisement: builder.mutation({
      query: ({ id, body }) => ({
        url: `/advertisements/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [Tags.Advertisements],
    }),
    deleteAdvertisement: builder.mutation({
      query: (id) => ({
        url: `/advertisements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [Tags.Advertisements],
    }),
    getAllApplications: builder.query({
      query: () => ({
        url: `/applications`,
        method: "GET",
      }),
      providesTags: [Tags.WIFI],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),
    updateApplicationStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/applications/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [Tags.WIFI], // This will refetch applications after status update
    }),
    getAllInstallationRequests: builder.query({
      query: () => ({
        url: `/installation-requests/all-insallation-requests`,
        method: "GET",
      }),
      providesTags: [Tags.WIFI],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),
    getEngineers: builder.query({
      query: () => ({
        url: `/client/engineers`,
        method: "GET",
      }),
      providesTags: [Tags.WIFI],
      keepUnusedDataFor: 300, // Keep data for 5 minutes
    }),
    updateInstallationRequestStatus: builder.mutation({
      query: ({ id, status, remarks, assignedEngineer }) => ({
        url: `/installation-requests/${id}/status`,
        method: "PATCH",
        body: { status, remarks, assignedEngineer },
      }),
      invalidatesTags: [Tags.WIFI], // This will refetch installation requests after status update
    }),
  }),
});

export const {
  useAddAdvertisementMutation,
  useGetAdvertisementsQuery,
  useUpdateAdvertisementMutation,
  useDeleteAdvertisementMutation,
  useGetAllApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useGetAllInstallationRequestsQuery,
  useGetEngineersQuery,
  useUpdateInstallationRequestStatusMutation
} = api;