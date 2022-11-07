import { Subjects } from "../../features/domain/subjects";
import * as React from "react";
import { ReactElement } from "react";
import { Grid } from "@mui/material";
import { CreditItem } from "./CreditItem";
import { AddCreditForm } from "./AddCreditForm";
import { subjects } from "../../utils/translation";

enum ActionType {
  LASTNAME_CHANGED = "LASTNAME_CHANGED",
  CLIENT_CREATED = "CLIENT_CREATED",
  FIRSTNAME_CHANGED = "FIRSTNAME_CHANGED",
  CREDITS_ADDED = "CREDITS_ADDED",
  ADD_CREDIT_CHANGED = "ADD_CREDIT_CHANGED",
}

type AddClientState = {
  lastname: string;
  firstname: string;
  credits: { subject: Subjects; value: number }[];
  creditsItems: ReactElement[];
  availableSubjects: { subject: Subjects; title: string }[];
  addCreditForm: ReactElement | undefined;
};
type AddClientAction =
  | {
      type: ActionType.LASTNAME_CHANGED;
      lastname: string;
    }
  | {
      type: ActionType.FIRSTNAME_CHANGED;
      firstname: string;
    }
  | {
      type: ActionType.CREDITS_ADDED;
      credits: { subject: Subjects; value: number };
    }
  | {
      type: ActionType.ADD_CREDIT_CHANGED;
      onAddCredits: (creditsAmount: number, subject: Subjects) => void;
    }
  | {
      type: ActionType.CLIENT_CREATED;
    };
export const addClientReducer = (
  state: AddClientState,
  action: AddClientAction
): AddClientState => {
  switch (action.type) {
    case ActionType.ADD_CREDIT_CHANGED:
      return {
        ...state,
        addCreditForm: (
          <AddCreditForm
            key={`add-credit-form-`.concat(Math.random().toString())}
            subjects={state.availableSubjects}
            onAddCredits={action.onAddCredits}
          />
        ),
      };
    case ActionType.CREDITS_ADDED: {
      const availableSubjects = state.availableSubjects.filter(
        (currentSubject) => action.credits.subject !== currentSubject.subject
      );
      return {
        ...state,
        credits: [...state.credits, action.credits],
        creditsItems: [
          ...state.creditsItems,
          <CreditItemContainer
            key={Math.random()}
            creditsAmount={action.credits.value}
            subject={action.credits.subject}
          />,
        ],
        availableSubjects,
        addCreditForm: undefined,
      };
    }
    case ActionType.FIRSTNAME_CHANGED:
      return { ...state, firstname: action.firstname };
    case ActionType.CLIENT_CREATED:
      return {
        lastname: "",
        firstname: "",
        credits: [],
        creditsItems: [],
        availableSubjects: subjects,
        addCreditForm: undefined,
      };
    case ActionType.LASTNAME_CHANGED:
      return { ...state, lastname: action.lastname };
  }
};
export const updateLastname = (lastname: string): AddClientAction => {
  return { lastname, type: ActionType.LASTNAME_CHANGED };
};
export const updateFirstname = (firstname: string): AddClientAction => {
  return { firstname, type: ActionType.FIRSTNAME_CHANGED };
};
export const clientCreated = (): AddClientAction => {
  return { type: ActionType.CLIENT_CREATED };
};
export const creditsAdded = (credits: {
  subject: Subjects;
  value: number;
}): AddClientAction => {
  return { credits, type: ActionType.CREDITS_ADDED };
};
export const addCreditChanged = (
  fn: (creditsAmount: number, subject: Subjects) => void
): AddClientAction => {
  return { onAddCredits: fn, type: ActionType.ADD_CREDIT_CHANGED };
};
const CreditItemContainer = ({
  creditsAmount,
  subject,
}: {
  creditsAmount: number;
  subject: Subjects;
}) => {
  return (
    <Grid
      key={"credit-item-container-".concat(Math.random().toString())}
      container
      direction="row"
      sx={{
        paddingTop: "4px",
      }}
    >
      <CreditItem
        key={"credit-item".concat(Math.random().toString())}
        credits={{ value: creditsAmount, subject: subject }}
      />
    </Grid>
  );
};
