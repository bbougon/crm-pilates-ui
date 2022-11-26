import { describe, expect, it } from "vitest";
import {
  SessionDetailsState,
  addAttendees,
  addAttendeesFailed,
  initializeSessionDetailsReducer,
  sessionDetailsReducer,
} from "../reducers";
import {
  AttendeeBuilder,
  AttendeesBuilder,
  SessionBuilder,
} from "../../../../test-utils/classroom/session";
import { ClientsBuilder } from "../../../../test-utils/clients/clients";
import { Client } from "../../../../features/domain/client";
import { Attendee } from "../../../../features/domain/session";

describe("Add attendees", () => {
  it("should initialize state with button disabled when all positions are filled", () => {
    expect(
      initializeSessionDetailsReducer(
        new SessionBuilder()
          .withPosition(2)
          .withAttendees(new AttendeesBuilder().for(2).build())
          .build()
      )
    ).toHaveProperty("addAttendeeButtonDisabled", true);
  });

  it("should add attendees with session former attendees", () => {
    const firstAttendee = new AttendeeBuilder().build();
    const state: SessionDetailsState = {
      addAttendeeButtonDisabled: false,
      form: undefined,
      session: new SessionBuilder()
        .withPosition(2)
        .withAttendee(firstAttendee)
        .build(),
    };

    const secondAttendee = new AttendeeBuilder().build();
    const sessionDetailsState = sessionDetailsReducer(
      state,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      addAttendees([secondAttendee], () => {})
    );

    expect(sessionDetailsState.session.attendees).toHaveLength(2);
    expect(sessionDetailsState.session.attendees).toMatchObject([
      firstAttendee,
      secondAttendee,
    ]);
  });

  it("should remove attendees on failure", () => {
    const attendees = new AttendeesBuilder().for(3).build();
    const state: SessionDetailsState = {
      addAttendeeButtonDisabled: true,
      form: undefined,
      session: new SessionBuilder()
        .withPosition(3)
        .withAttendees(attendees)
        .build(),
    };

    const sessionDetailsState = sessionDetailsReducer(
      state,
      addAttendeesFailed(
        [attendees[1], attendees[2]],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        new ClientsBuilder().for(3).build() as Client[],
        // eslint-disable-next-line @typescript-eslint/no-empty-function,unused-imports/no-unused-vars
        (attendees: Attendee[]) => {}
      )
    );

    expect(sessionDetailsState.session.attendees).toHaveLength(1);
    expect(sessionDetailsState.session.attendees).toMatchObject([attendees[0]]);
    expect(sessionDetailsState.form).not.toBeUndefined();
    expect(sessionDetailsState.addAttendeeButtonDisabled).toBeFalsy();
  });

  it("should disable button when adding attendees to max position", () => {
    const session = new SessionBuilder()
      .withPosition(3)
      .withAttendees(new AttendeesBuilder().for(2).build())
      .build();
    const state: SessionDetailsState = {
      addAttendeeButtonDisabled: false,
      form: undefined,
      session,
    };
    let receivedClassroomId = "";
    let receivedAttendees: Attendee[] = [];
    let receivedSessionDate = "";
    const addedAttendees = new AttendeesBuilder().for(1).build();
    const sessionDetailsState = sessionDetailsReducer(
      state,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      addAttendees(addedAttendees, (classroomId, session_date, attendees) => {
        receivedClassroomId = classroomId;
        receivedAttendees = attendees;
        receivedSessionDate = session_date;
      })
    );

    expect(sessionDetailsState.addAttendeeButtonDisabled).toBeTruthy();
    expect(receivedClassroomId).toEqual(session.classroomId);
    expect(receivedSessionDate).toEqual(session.schedule.start);
    expect(receivedAttendees).toMatchObject(
      session.attendees.concat(addedAttendees) as unknown as Attendee[]
    );
  });
});
