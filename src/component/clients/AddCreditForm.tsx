import * as React from "react";
import { BaseSyntheticEvent, useReducer } from "react";
import { Subjects } from "../../features/domain/subjects";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import {
  creditsReducer,
  selectSubject,
  updateCredits,
} from "./reducers/Credits";

type AddCreditFormProps = {
  subjects: { subject: Subjects; title: string }[] | [];
  onAddCredits: (creditsAmount: number, subject: Subjects) => void;
};

export const AddCreditForm = ({
  onAddCredits,
  subjects,
}: AddCreditFormProps) => {
  const [state, dispatchReducer] = useReducer(creditsReducer, {
    creditsAmount: 0,
    subject: undefined,
  });

  const onSubjectChanged = (e: SelectChangeEvent<Subjects | unknown>) =>
    dispatchReducer(selectSubject(e.target.value as Subjects));
  const onCreditsAmountChanged = (e: BaseSyntheticEvent) => {
    const creditsAmount: number = +e.target.value;
    return dispatchReducer(updateCredits(creditsAmount));
  };
  const onSubmitClicked = (_: BaseSyntheticEvent) => {
    onAddCredits(state.creditsAmount, state.subject!);
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
            InputProps={{ inputProps: { min: 1 } }}
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
