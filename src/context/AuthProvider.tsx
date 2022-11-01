import * as React from "react";
import { createContext } from "react";
import { useSelector } from "react-redux";
import { Token } from "../features/domain/token";
import { getAuthToken } from "../features/auth";

const AuthContext = createContext<Token>({ token: null, type: "bearer" });

export const AuthProvider: React.FC<React.ReactNode> = ({ children }) => {
  const token: Token = useSelector(getAuthToken);
  return <AuthContext.Provider value={token}>{children}</AuthContext.Provider>;
};

export default AuthContext;
