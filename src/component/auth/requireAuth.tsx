import * as React from "react";
import { useAuth } from "../../hooks/useAuth";
import { Token } from "../../features/domain/token";
import { Outlet, Navigate } from "react-router-dom";

const RequireAuth = () => {
  const token: Token = useAuth();
  return token.token !== null && token.token !== "" ? (
    <Outlet />
  ) : (
    <Navigate to="/login" />
  );
};

export default RequireAuth;
