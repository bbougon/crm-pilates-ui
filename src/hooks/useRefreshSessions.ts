import { useContext } from "react";
import RefreshSessionsContext from "../context/RefreshSessionsProvider";

export const useRefreshSessions = () => {
  return useContext(RefreshSessionsContext);
};
