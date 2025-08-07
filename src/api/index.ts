import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const BASE_URL = `http://51.21.19.38:8000`;

const Tags = {
  Advertisements: "Advertisements",
  WIFI:"WIFI",
  COMPLAINTS:"COMPLAINTS"
};

export const LIMIT = 20;

// Base query function for making requests
const baseQuery = fetchBaseQuery({
  baseUrl: `${BASE_URL}/api/v1`,
  prepareHeaders: (headers) => {
    const auth =`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODkyMmYyMGRjNTk0N2U0NjhkMmNiYTciLCJyb2xlIjoic3VwZXJhZG1pbiIsImp0aSI6Ik5kRlFFc2JLIiwiaWF0IjoxNzU0NTAxMzk3LCJleHAiOjE3NTcwOTMzOTd9.gpsA_mL9gUQXPKyEWkiTOhU6AC9r9la33ufpwfKKa_w`;
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
    getAllComplaints: builder.query({
      query: (params: { page?: number; limit?: number; type?: string; status?: string; priority?: string } = {}) => ({
        url: `/complaints`,
        method: "GET",
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.type && { type: params.type }),
          ...(params.status && { status: params.status }),
          ...(params.priority && { priority: params.priority }),
        },
      }),
      providesTags: [Tags.WIFI],
    }),
    getAllComplaintDasboard: builder.query({
      query: ()=> ({
        url: `/complaints/complaint-dashboard`,
        method: "GET"
      }),
    }),
    assignEngineerToComplaint: builder.mutation({
      query: ({ id, engineerId, priority }) => ({
        url: `/complaints/${id}/assign`,
        method: "PUT",
        body: { engineerId, priority },
      }),
      invalidatesTags: [Tags.WIFI], // This will refetch complaints after assignment
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
  useUpdateInstallationRequestStatusMutation,
  useGetAllComplaintsQuery,
  useAssignEngineerToComplaintMutation,
  useGetAllComplaintDasboardQuery
} = api;