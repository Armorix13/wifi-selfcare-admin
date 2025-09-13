import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const BASE_URL = `http://51.21.19.38:8000`;

const Tags = {
  Advertisements: "Advertisements",
  WIFI: "WIFI",
  COMPLAINTS: "COMPLAINTS",
  PRODUCT: "PRODUCT",
  PLANS: "PLANS",
  ENGINEER: "ENGINEER",
  ADMIN: "ADMIN",
  LEADS: "LEADS",
  LEAVE_REQUESTS: "LEAVE_REQUESTS",
  USERMANAGEMENT: "USERMANAGEMENT"
};

export const LIMIT = 20;

// Base query function for making requests
const baseQuery = fetchBaseQuery({
  baseUrl: `${BASE_URL}/api/v1`,
  prepareHeaders: (headers) => {
    // Get access token from localStorage
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 unauthorized responses
  if (result.error && result.error.status === 401) {
    // Token expired or invalid, redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('loglevel');
    window.location.href = '/admin/login';

  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [...Object.values(Tags)],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: `/client/admin-login`,
        method: "POST",
        body,
      }),
    }),
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
    getCompanyProfile: builder.query({
      query: () => ({
        url: `/client/company-profile`,
        method: "GET",
      }),
      providesTags: [Tags.ADMIN],
    }),
    updateCompanyProfile: builder.mutation({
      query: (body) => ({
        url: `/client/company-profile`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [Tags.ADMIN],
    }),
    addCompanyProfile: builder.mutation({
      query: (body) => ({
        url: `/client/add-company`,
        method: "POST",
        body,
      }),
      invalidatesTags: [Tags.ADMIN],
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
    }),
    updateInstallationRequestStatus: builder.mutation({
      query: ({ id, status, remarks, assignedEngineer, oltId, fdbId, modemName, ontType, modelNumber, serialNumber, ontMac, username, password,
        mtceFranchise, bbUserId, ftthExchangePlan, bbPlan, workingStatus, ruralUrban, acquisitionType
      }) => ({
        url: `/installation-requests/${id}/status`,
        method: "PATCH",
        body: {
          status, remarks, assignedEngineer, oltId, fdbId, modemName, ontType, modelNumber, serialNumber, ontMac, username, password,
          mtceFranchise, bbUserId, ftthExchangePlan, bbPlan, workingStatus, ruralUrban, acquisitionType
        },
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
      query: () => ({
        url: `/complaints/complaint-dashboard`,
        method: "GET"
      }),
      providesTags: [Tags.COMPLAINTS]
    }),
    assignEngineerToComplaint: builder.mutation({
      query: ({ id, engineerId, priority }) => ({
        url: `/complaints/${id}/assign`,
        method: "PUT",
        body: { engineerId, priority },
      }),
      invalidatesTags: [Tags.WIFI], // This will refetch complaints after assignment
    }),
    getProductDashbaordData: builder.query({
      query: () => ({
        url: `/dashboard/product-analytics`,
        method: "GET"
      }),
      providesTags: [Tags.PRODUCT]
    }),
    getEngineerDashbaordData: builder.query({
      query: () => ({
        url: `/dashboard/engineer-analytics`,
        method: "GET"
      }),
      providesTags: [Tags.ENGINEER]
    }),
    getplansDashbaordData: builder.query({
      query: () => ({
        url: `/dashboard/service-plans`,
        method: "GET"
      }),
      providesTags: [Tags.PLANS],
    }),
    addEngineerData: builder.mutation({
      query: (body) => ({
        url: `/dashboard/add-engineer`,
        method: "POST",
        body
      }),
      invalidatesTags: [Tags.ENGINEER]
    }),
    updateEngineerData: builder.mutation({
      query: (body) => ({
        url: `/dashboard/update-engineer`,
        method: "PUT",
        body
      }),
      invalidatesTags: [Tags.ENGINEER]
    }),
    getAllLeaveRequestAnalytics: builder.query({
      query: () => ({
        url: `/dashboard/leave-requests-analytics`,
        method: "GET"
      }),
      providesTags: [Tags.LEAVE_REQUESTS],
    }),

    getAllLeaveRequest: builder.query({
      query: () => ({
        url: `/dashboard/leave-requests`,
        method: "GET"
      }),
      providesTags: [Tags.LEAVE_REQUESTS],
    }),
    approveRejectLeaveRequest: builder.mutation({
      query: ({ id, body }) => ({
        url: `/dashboard/leave-requests/approve-reject`,
        method: "POST",
        body
      }),
      invalidatesTags: [Tags.LEAVE_REQUESTS],
    }),

    addProduct: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [Tags.PRODUCT]

    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [Tags.PRODUCT]
    }),
    getCategories: builder.query({
      query: () => ({
        url: '/categories',
        method: 'GET',
      }),
      providesTags: [Tags.PRODUCT]
    }),
    addFibrePlan: builder.mutation({
      query: (body) => ({
        url: '/plans',
        method: 'POST',
        body
      }),
      invalidatesTags: [Tags.PLANS],
    }),
    editFibrePlan: builder.mutation({
      query: ({ id, body }) => ({
        url: `/plans/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: [Tags.PLANS],
    }),
    deleteFibrePlan: builder.mutation({
      query: (id) => ({
        url: `/plans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [Tags.PLANS],
    }),
    addIptvlan: builder.mutation({
      query: (body) => ({
        url: '/iptvplan/add',
        method: 'POST',
        body
      }),
      invalidatesTags: [Tags.PLANS],
    }),
    editIptvlan: builder.mutation({
      query: ({ id, body }) => ({
        url: `/iptvplan/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: [Tags.PLANS],
    }),
    deleteIptvlan: builder.mutation({
      query: (id) => ({
        url: `/iptvplan/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [Tags.PLANS],
    }),
    addOttPlan: builder.mutation({
      query: (body) => ({
        url: '/ottplans/add',
        method: 'POST',
        body
      }),
      invalidatesTags: [Tags.PLANS],
    }),
    deleteOttPlan: builder.mutation({
      query: (id) => ({
        url: `/ottplans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [Tags.PLANS],
    }),
    editOttPlan: builder.mutation({
      query: ({ id, body }) => ({
        url: `/ottplans/${id}`,
        method: "PUT",
        body
      }),
      invalidatesTags: [Tags.PLANS],
    }),
    updateProduct: builder.mutation({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [Tags.PRODUCT]
    }),
    deleteEngineer: builder.mutation({
      query: (id) => ({
        url: `/dashboard/engineers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [Tags.ENGINEER],
    }),
    // Admin endpoints
    getAdminDashboardData: builder.query({
      query: () => ({
        url: `/dashboard/admin-analytics`,
        method: "GET",
      }),
      providesTags: [Tags.ADMIN],
    }),
    addAdminData: builder.mutation({
      query: (body) => ({
        url: `/dashboard/add-admin`,
        method: "POST",
        body,
      }),
      invalidatesTags: [Tags.ADMIN],
    }),
    getOltData: builder.query({
      query: () => ({
        url: `/dashboard/olts`,
        method: "GET",
      }),
    }),
    updateAdminData: builder.mutation({
      query: (body) => ({
        url: `/dashboard/update-admin`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [Tags.ADMIN],
    }),
    getAnalyticsAdminData: builder.query({
      query: (body) => ({
        url: `/client/admin-dashboard`,
        method: "GET",
      }),
      providesTags: [Tags.ADMIN],
    }),
    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/dashboard/admins/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [Tags.ADMIN],
    }),
    activateAdmin: builder.mutation({
      query: ({ id, body }) => ({
        url: `/dashboard/admins/${id}/activate`,
        method: "POST",
        body,
      }),
      invalidatesTags: [Tags.ADMIN],
    }),
    getAllLeads: builder.query({

      query: () => ({
        url: `/leads`,
        method: "GET",
      }),
      providesTags: [Tags.LEADS],
    }),
    markLeadAsTracked: builder.mutation({
      query: ({ id, body }) => ({
        url: `/leads/${id}/status`,
        method: "PATCH",
        body
      }),
      invalidatesTags: [Tags.LEADS],
    }),
    getAllSelectNodes: builder.query({
      query: () => ({
        url: `/network/olt/select/node`,
        method: "GET",
      }),
    }),
    getFdbsByOltId: builder.query({
      query: () => ({
        url: `/network/olt/select/node`,
        method: "GET",
      }),
    }),
    addUser: builder.mutation({
      query: (body) => ({
        url: `/dashboard/add-user`,
        method: "POST",
        body,
      }),
      invalidatesTags: [Tags.USERMANAGEMENT],
    }),
    getUserManagementData: builder.query({
      query: ({ page, search }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        if (search) {
          params.append('search', search);
        }
        return {
          url: `/dashboard/user-management?${params.toString()}`,
          method: "GET"
        };
      },
      providesTags: [Tags.USERMANAGEMENT],
    }),
    getUserById: builder.query({
      query: (id) => ({
        url: `/dashboard/user/${id}/details-for-update`,
        method: "GET",
      }),
    }),
    updateUserByAdmin: builder.mutation({
      query: (body) => ({
        url: `/dashboard/update-user`,
        method: "PUT",
        body,
      }),
    }),
    getCompleteUserDetailbyId: builder.query({
      query: (id) => ({
        url: `/dashboard/client/${id}/full-details`,
        method: "GET",
      }),
    }),
    importClientFromExcel: builder.mutation({
      query: (body) => ({
        url: `/dashboard/upload-users-excel`,
        method: "POST",
        body,
      }),
      invalidatesTags: [Tags.USERMANAGEMENT],
    }),
    getFullEngineerDetails: builder.query<any, string>({
      query: (id:any) => ({
        url: `/dashboard/engineers/${id}/full-details`,
        method: "GET",
      })
    })
  })
});

export const {
  useLoginMutation,
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
  useGetAllComplaintDasboardQuery,
  useGetProductDashbaordDataQuery,
  useGetplansDashbaordDataQuery,
  useAddFibrePlanMutation,
  useAddOttPlanMutation,
  useAddIptvlanMutation,
  useDeleteFibrePlanMutation,
  useDeleteIptvlanMutation,
  useDeleteOttPlanMutation,
  useEditFibrePlanMutation,
  useEditIptvlanMutation,
  useEditOttPlanMutation,
  useUpdateProductMutation,
  useGetCategoriesQuery,
  useAddProductMutation,
  useDeleteProductMutation,
  useGetEngineerDashbaordDataQuery,
  useAddEngineerDataMutation,
  useUpdateEngineerDataMutation,
  useDeleteEngineerMutation,
  // Admin hooks
  useGetAdminDashboardDataQuery,
  useAddAdminDataMutation,
  useUpdateAdminDataMutation,
  useDeleteAdminMutation,
  useActivateAdminMutation,
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
  useAddCompanyProfileMutation,
  useGetAnalyticsAdminDataQuery,
  useGetAllLeadsQuery,
  useMarkLeadAsTrackedMutation,
  useGetAllLeaveRequestAnalyticsQuery,
  useGetAllLeaveRequestQuery,
  useApproveRejectLeaveRequestMutation,
  useGetOltDataQuery,
  useGetAllSelectNodesQuery,
  useGetFdbsByOltIdQuery,
  useAddUserMutation,
  useGetUserManagementDataQuery,
  useGetUserByIdQuery,
  useUpdateUserByAdminMutation,
  useGetCompleteUserDetailbyIdQuery,
  useImportClientFromExcelMutation,
  useGetFullEngineerDetailsQuery
} = api;