"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { setCredentials, logout } from "./authSlice";
import type { User } from "./auth.types";
import { getStoredAuth, clearStoredAuth } from "./authStorage";

export const useAuth = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const storedAuth = getStoredAuth();

    if (storedAuth) {
      dispatch(
        setCredentials({
          user: storedAuth.user,
          token: storedAuth.token,
        }),
      );
    }

    setIsAuthLoading(false);
  }, [dispatch]);

  const saveCredentials = (userData: User, token: string) => {
    dispatch(
      setCredentials({
        user: userData,
        token,
      }),
    );
  };

  const clearAuth = () => {
    dispatch(logout());
    clearStoredAuth();
  };

  return {
    user,
    token,
    isAuthLoading,
    saveCredentials,
    clearAuth,
  };
};
