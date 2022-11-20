import * as React from "react";
import { createContext } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { SessionsLink } from "../features/domain/session";
import { fetchSessions } from "../features/sessionsSlice";
import { useAppDispatch } from "../hooks/redux";

export interface RefreshSessionsAction {
  refresh: () => void;
}

const RefreshSessionsContext = createContext<RefreshSessionsAction>({
  refresh: () => null,
});

export const RefreshSessionsProvider: React.FC = ({ children }) => {
  const link: SessionsLink | undefined = useSelector<
    RootState,
    SessionsLink | undefined
  >((state) => state.sessions.link);
  const dispatch = useAppDispatch();

  const refreshSessions = () => {
    dispatch(fetchSessions(link?.current.url));
  };

  return (
    <RefreshSessionsContext.Provider
      value={{ refresh: () => refreshSessions() }}
    >
      {children}
    </RefreshSessionsContext.Provider>
  );
};

export default RefreshSessionsContext;
