import { SessionState, SessionStatus } from "../../../features/sessionsSlice";
import { Session } from "../../../features/domain/session";

export class LoadingState {
  state: SessionState = {
    sessions: [],
    status: SessionStatus.LOADING,
    error: [],
    link: undefined,
  };

  withState = (sessions: Session[]) => {
    this.state.sessions = sessions;
    return this;
  };

  build = () => {
    return this.state;
  };
}
