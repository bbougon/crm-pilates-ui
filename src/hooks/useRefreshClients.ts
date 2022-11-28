import { useContext } from "react";
import RefreshClientsContext from "../context/RefreshClientsProvider";

export const useRefreshClients = () => {
  return useContext(RefreshClientsContext);
};
