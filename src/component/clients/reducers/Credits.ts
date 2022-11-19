import { Subjects } from "../../../features/domain/subjects";

enum ActionType {
  SUBJECT_SELECTED = "SUBJECT_SELECTED",
  CREDITS_ADDED = "CREDITS_ADDED",
}

export type PositiveNumber<T extends number> = number extends T
  ? never
  : `${T}` extends `-${string}` | `${string}.${string}`
  ? never
  : T;

type State = {
  subject?: Subjects;
  creditsAmount: number;
};
type Action =
  | {
      type: ActionType.SUBJECT_SELECTED;
      subject: Subjects;
    }
  | {
      type: ActionType.CREDITS_ADDED;
      creditsAmount: number;
    };
const selectSubject = (subject: Subjects): Action => {
  return { subject, type: ActionType.SUBJECT_SELECTED };
};
const updateCredits = (creditsAmount: number): Action => {
  return { creditsAmount, type: ActionType.CREDITS_ADDED };
};
const creditsReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.SUBJECT_SELECTED:
      return { ...state, subject: action.subject };
    case ActionType.CREDITS_ADDED:
      return { ...state, creditsAmount: action.creditsAmount };
  }
};

export { selectSubject, updateCredits, creditsReducer };
