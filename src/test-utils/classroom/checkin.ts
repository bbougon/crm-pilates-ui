import { ApiSession } from "../../api";

export const checkinResponse = (
  session_id: string,
  classroom_id: string,
  session: ApiSession
) => {
  return {
    id: session_id,
    name: session.name,
    classroom_id: classroom_id,
    position: session.position,
    schedule: {
      start: session.schedule.start,
      stop: session.schedule.stop,
    },
    attendees: session.attendees,
  };
};
export const checkout = (
  session_id: string,
  classroom_id: string,
  session: ApiSession
) => {
  return checkinResponse(session_id, classroom_id, session);
};
export const cancellationResponse = (
  session_id: string,
  classroom_id: string,
  session: ApiSession
) => {
  return checkinResponse(session_id, classroom_id, session);
};
