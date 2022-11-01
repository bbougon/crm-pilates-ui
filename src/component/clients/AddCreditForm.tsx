import * as React from "react";
import { BaseSyntheticEvent, useReducer } from "react";
import { Subjects } from "../../features/domain/subjects";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { Button } from "@material-ui/core";

type AddCreditFormProps = {
  subjects: { subject: Subjects; title: string }[] | [];
  onAddCredits: (creditsAmount: number, subject: Subjects) => void;
};

enum ActionType {
  SUBJECT_SELECTED = "SUBJECT_SELECTED",
  CREDITS_ADDED = "CREDITS_ADDED",
}

type State = {
  subject?: Subjects | unknown;
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

const addCredits = (creditsAmount: number): Action => {
  return { creditsAmount, type: ActionType.CREDITS_ADDED };
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.SUBJECT_SELECTED:
      return { ...state, subject: action.subject };
    case ActionType.CREDITS_ADDED:
      return { ...state, creditsAmount: action.creditsAmount };
  }
};

export const AddCreditForm = ({
  onAddCredits,
  subjects,
}: AddCreditFormProps) => {
  const [state, dispatchReducer] = useReducer(reducer, { creditsAmount: 0 });

  const onSubjectChanged = (e: SelectChangeEvent<Subjects | unknown>) =>
    dispatchReducer(selectSubject(e.target.value as Subjects));
  const onCreditsAmountChanged = (e: BaseSyntheticEvent) =>
    dispatchReducer(addCredits(+e.target.value));
  const onSubmitClicked = (e: BaseSyntheticEvent) => {
    onAddCredits(state.creditsAmount, state.subject);
  };

  return (
    <Grid
      container
      direction="row"
      sx={{
        paddingBottom: "4px",
        alignItems: "center",
      }}
    >
      <Grid
        item
        xs={2}
        sx={{
          display: "flex",
          textAlign: "left",
          justifyContent: "flex-start",
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="subject-select-label">Subject</InputLabel>
          <Select
            labelId="subject-select-label"
            id="subject-select"
            value={state.subject || ""}
            required
            placeholder="Select a subject"
            label="Subject"
            variant="standard"
            onChange={onSubjectChanged}
            size="small"
          >
            {subjects.map((subject) => (
              <MenuItem key={subject.subject} value={subject.subject}>
                {subject.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid
        item
        xs={4}
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          paddingLeft: "16px",
        }}
      >
        <FormControl>
          <TextField
            id="credits-amount"
            size="small"
            type="number"
            label="Amount of credits"
            required
            variant="standard"
            onChange={onCreditsAmountChanged}
            value={state.creditsAmount}
            aria-describedby="credits-amount-help"
          />
        </FormControl>
      </Grid>
      <Grid
        item
        xs={5}
        sx={{
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <Button size="small" onClick={onSubmitClicked}>
          Add credits
        </Button>
      </Grid>
    </Grid>
  );
};
