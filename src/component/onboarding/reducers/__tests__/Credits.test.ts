import { describe, it } from "vitest";
import { creditsReducer, updateCredits } from "../Credits";
import { Subjects } from "../../../../features/domain/subjects";

describe("Add Credits", () => {
  it("should update credits", () => {
    const { subject, creditsAmount } = creditsReducer(
      { subject: Subjects.MAT, creditsAmount: 2 },
      updateCredits(10)
    );

    expect(subject).toEqual(Subjects.MAT);
    expect(creditsAmount).toEqual(10);
  });
});
