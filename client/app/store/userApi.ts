import { api } from "./api";
import type { UsersResponse } from "./user.types";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, void>({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetUsersQuery } = userApi;
