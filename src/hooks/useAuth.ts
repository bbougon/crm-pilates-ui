import { useContext } from "react";
import AuthContext from "../context/AuthProvider";
import { Token } from "../features/domain/token";

export const useAuth = (): Token => {
  return useContext(AuthContext);
};
