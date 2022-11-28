import * as React from "react";
import { createContext } from "react";
import { useAppDispatch } from "../hooks/redux";
import { fetchClients } from "../features/clientsSlice";

export interface RefreshClientsAction {
  refresh: () => void;
}

const RefreshClientsContext = createContext<RefreshClientsAction>({
  refresh: () => null,
});

export const RefreshClientsProvider: React.FC = ({ children }) => {
  const dispatch = useAppDispatch();

  const refreshClients = () => {
    dispatch(fetchClients());
  };

  return (
    <RefreshClientsContext.Provider value={{ refresh: () => refreshClients() }}>
      {children}
    </RefreshClientsContext.Provider>
  );
};

export default RefreshClientsContext;
