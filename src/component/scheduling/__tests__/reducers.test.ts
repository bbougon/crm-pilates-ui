import { describe, expect, it } from "vitest";
import { ActionType, SchedulingState, schedulingReducer } from "../reducers";
import { formatISO, parseISO } from "date-fns";
import { faker } from "@faker-js/faker";

describe("Reducers", () => {
  describe("Scheduling reducers", () => {
    describe("When end date updated", () => {
      it("should calculate duration in minutes", () => {
        const state: SchedulingState = new SchedulingStateBuilder()
          .startAt("2022-09-09T10:00")
          .endsAt("2022-09-09T11:00")
          .build();

        const { duration, classroomStartDateTime, classroomEndDateTime } =
          schedulingReducer(state, {
            type: ActionType.END_DATE_UPDATED,
            endDate: parseISO("2022-09-09T12:00"),
          });

        expect(duration).toEqual(120);
        expect(classroomStartDateTime).toEqual(
          formatISO(parseISO("2022-09-09T10:00"))
        );
        expect(classroomEndDateTime).toEqual(
          formatISO(parseISO("2022-09-09T12:00"))
        );
      });

      it("should calculate closest 5 minutes duration", () => {
        const state: SchedulingState = new SchedulingStateBuilder()
          .startAt("2022-09-09T10:10")
          .endsAt("2022-09-09T11:10")
          .build();

        const { duration, classroomStartDateTime, classroomEndDateTime } =
          schedulingReducer(state, {
            type: ActionType.END_DATE_UPDATED,
            endDate: parseISO("2022-09-09T11:23"),
          });

        expect(duration).toEqual(75);
        expect(classroomStartDateTime).toEqual(
          formatISO(parseISO("2022-09-09T10:10"))
        );
        expect(classroomEndDateTime).toEqual(
          formatISO(parseISO("2022-09-09T11:25"))
        );
      });

      it("should not calculate duration if not in available duration", () => {
        const state: SchedulingState = new SchedulingStateBuilder()
          .startAt("2022-09-09T10:10")
          .endsAt("2022-09-09T11:10")
          .build();

        const { duration, classroomStartDateTime, classroomEndDateTime } =
          schedulingReducer(state, {
            type: ActionType.END_DATE_UPDATED,
            endDate: parseISO("2022-09-09T11:18"),
          });

        expect(duration).toEqual(60);
        expect(classroomStartDateTime).toEqual(
          formatISO(parseISO("2022-09-09T10:10"))
        );
        expect(classroomEndDateTime).toEqual(
          formatISO(parseISO("2022-09-09T11:20"))
        );
      });
    });

    describe("When start date updated", () => {
      it("should calculate duration in minutes", () => {
        const state: SchedulingState = new SchedulingStateBuilder()
          .startAt("2022-09-09T10:00")
          .endsAt("2022-09-09T11:00")
          .build();

        const { duration, classroomStartDateTime, classroomEndDateTime } =
          schedulingReducer(state, {
            type: ActionType.START_DATE_UPDATED,
            startDate: parseISO("2022-09-09T09:00"),
          });

        expect(duration).toEqual(120);
        expect(classroomStartDateTime).toEqual(
          formatISO(parseISO("2022-09-09T09:00"))
        );
        expect(classroomEndDateTime).toEqual(
          formatISO(parseISO("2022-09-09T11:00"))
        );
      });

      it("should calculate closest 5 minutes duration", () => {
        const state: SchedulingState = new SchedulingStateBuilder()
          .startAt("2022-09-09T10:10")
          .endsAt("2022-09-09T11:10")
          .build();

        const { duration, classroomStartDateTime, classroomEndDateTime } =
          schedulingReducer(state, {
            type: ActionType.START_DATE_UPDATED,
            startDate: parseISO("2022-09-09T09:53"),
          });

        expect(duration).toEqual(75);
        expect(classroomStartDateTime).toEqual(
          formatISO(parseISO("2022-09-09T09:55"))
        );
        expect(classroomEndDateTime).toEqual(
          formatISO(parseISO("2022-09-09T11:10"))
        );
      });

      it("should not calculate duration if not in available duration", () => {
        const state: SchedulingState = new SchedulingStateBuilder()
          .startAt("2022-09-09T10:10")
          .endsAt("2022-09-09T11:10")
          .build();

        const { duration, classroomStartDateTime, classroomEndDateTime } =
          schedulingReducer(state, {
            type: ActionType.START_DATE_UPDATED,
            startDate: parseISO("2022-09-09T09:18"),
          });

        expect(duration).toEqual(60);
        expect(classroomStartDateTime).toEqual(
          formatISO(parseISO("2022-09-09T09:20"))
        );
        expect(classroomEndDateTime).toEqual(
          formatISO(parseISO("2022-09-09T11:10"))
        );
      });
    });

    describe("When duration is updated", () => {
      it("should calculate end date", () => {
        const state: SchedulingState = new SchedulingStateBuilder()
          .startAt("2022-09-09T10:00")
          .endsAt("2022-09-09T11:00")
          .build();

        const { duration, classroomStartDateTime, classroomEndDateTime } =
          schedulingReducer(state, {
            type: ActionType.DURATION_UPDATED,
            duration: 75,
          });

        expect(duration).toEqual(75);
        expect(classroomStartDateTime).toEqual(
          formatISO(parseISO("2022-09-09T10:00"))
        );
        expect(classroomEndDateTime).toEqual(
          formatISO(parseISO("2022-09-09T11:15"))
        );
      });

      it("should calculate end date when recurring", () => {
        const state: SchedulingState = new SchedulingStateBuilder()
          .startAt("2022-09-09T10:00")
          .endsAt("2022-09-30T11:00")
          .build();

        const { duration, classroomStartDateTime, classroomEndDateTime } =
          schedulingReducer(state, {
            type: ActionType.DURATION_UPDATED,
            duration: 90,
          });

        expect(duration).toEqual(90);
        expect(classroomStartDateTime).toEqual(
          formatISO(parseISO("2022-09-09T10:00"))
        );
        expect(classroomEndDateTime).toEqual(
          formatISO(parseISO("2022-09-30T11:30"))
        );
      });
    });
  });
});

class SchedulingStateBuilder {
  private classroomStartDateTime = "2021-05-07T10:00";
  private classroomEndDateTime = "2021-05-07T11:00";
  private availableDurations = [
    { duration: 15, human: "0h15" },
    { duration: 30, human: "Oh30" },
    { duration: 45, human: "0h45" },
    { duration: 60, human: "1h00" },
    { duration: 75, human: "1h15" },
    { duration: 90, human: "1h30" },
    { duration: 105, human: "1h45" },
    { duration: 120, human: "2h00" },
  ];
  private classroomName = faker.name.firstName();
  private position = faker.datatype.number({ min: 0, max: 6 });
  private duration = 60;
  private attendees = [];
  private availablePositions = [1, 2, 3, 4, 5, 6];
  private subject = undefined;

  startAt(dateAsstring: string): SchedulingStateBuilder {
    this.classroomStartDateTime = formatISO(parseISO(dateAsstring));
    return this;
  }

  endsAt(dateAsString: string): SchedulingStateBuilder {
    this.classroomEndDateTime = formatISO(parseISO(dateAsString));
    return this;
  }

  build(): SchedulingState {
    return {
      classroomName: this.classroomName,
      position: this.position,
      duration: this.duration,
      classroomStartDateTime: this.classroomStartDateTime,
      classroomEndDateTime: this.classroomEndDateTime,
      attendees: this.attendees,
      availableDurations: this.availableDurations,
      availablePositions: this.availablePositions,
      subject: this.subject,
      fieldsAreFilled: (_) => false,
    };
  }
}
