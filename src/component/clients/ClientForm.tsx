import * as React from "react";
import { BaseSyntheticEvent, ReactElement, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { ClientStatus, createClient } from "../../features/clientsSlice";
import { DisplayError } from "../errors/DisplayError";
import { ErrorMessage } from "../../features/errors";
import { RootState } from "../../app/store";
import { Subjects } from "../../features/domain/subjects";
import { AddCreditButton } from "./AddCreditButton";
import { AddCreditForm } from "./AddCreditForm";
import { subjects } from "../../utils/translation";
import { CreditItem } from "./CreditItem";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Divider,
  FormControl,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: auto;
  text-align: left;
  width: 100%;
`;

const AddClientAccordionSummary = () => {
  const props = {
    expandIcon: <ExpandMoreIcon />,
    id: "panel1c-header",
  };
  return (
    <AccordionSummary {...props} aria-controls={"panel1c-content"}>
      <Typography variant="h6" color="textSecondary">
        Add a new client
      </Typography>
    </AccordionSummary>
  );
};

export const AddClientForm = () => {
  const dispatch = useDispatch();

  const errorMessages: ErrorMessage[] = useSelector<RootState, ErrorMessage[]>(
    (state) => state.clients.error
  );
  const status: ClientStatus = useSelector<RootState, ClientStatus>(
    (state) => state.clients.status
  );
  const [addCreditForms, setAddCreditForms] = useState<
    ReactElement | undefined
  >(undefined);
  const [creditItems, setCreditItems] = useState<ReactElement[]>([]);
  const [availableSubjects, setAvailableSubjects] =
    useState<{ subject: Subjects; title: string }[]>(subjects);
  const [addCreditsInProgress, setAddCreditsInProgress] = useState(false);
  let errorContent = undefined;

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [credits, setCredits] = useState<
    { value: number; subject: string }[] | []
  >([]);

  const onFirstnameChanged = (e: BaseSyntheticEvent) =>
    setFirstname(e.target.value);
  const onLastnameChanged = (e: BaseSyntheticEvent) =>
    setLastname(e.target.value);

  const onSubmitClicked = async () => {
    dispatch(createClient({ firstname, lastname, credits }));
    setLastname("");
    setFirstname("");
    setCreditItems([]);
  };

  const onAddCredits = (creditsAmount: number, subject: Subjects) => {
    setCredits([
      ...credits,
      { value: creditsAmount as number, subject: subject },
    ]);
    setCreditItems([
      ...creditItems,
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
      </Grid>,
    ]);
    setAddCreditForms(undefined);
    setAddCreditsInProgress(false);
    setAvailableSubjects(
      availableSubjects.filter(
        (currentSubject) => subject !== currentSubject.subject
      )
    );
  };

  const onAddCreditButton = () => {
    setAddCreditForms(
      <AddCreditForm
        key={`add-credit-form-`.concat(Math.random().toString())}
        subjects={availableSubjects}
        onAddCredits={onAddCredits}
      />
    );
    setAddCreditsInProgress(true);
  };

  if (status === ClientStatus.CREATION_FAILED) {
    errorContent = (
      <Grid container>
        <Grid item xs={12} md={12}>
          <DisplayError {...{ error: errorMessages }} />
        </Grid>
      </Grid>
    );
  }

  return (
    <Accordion>
      <AddClientAccordionSummary />
      <AccordionDetails>
        <Wrapper>
          <Grid container>
            <Grid item xs={12} md={3}>
              <FormControl>
                <TextField
                  className="sizeSmall"
                  aria-label="Client lastname"
                  label="Provide a client lastname"
                  helperText="Provide a client lastname"
                  required
                  onChange={onLastnameChanged}
                  value={lastname}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl aria-label="Client firstname">
                <TextField
                  className="sizeSmall"
                  label="Client firstname"
                  helperText="Provide a client's firstname"
                  required
                  onChange={onFirstnameChanged}
                  value={firstname}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid
            key={"credits-items-".concat(Math.random().toString())}
            container
            direction="column"
          >
            {creditItems}
          </Grid>
          {addCreditForms}
          <AddCreditButton
            key={`add-credit-button-`.concat(Math.random().toString())}
            disabled={addCreditsInProgress || availableSubjects.length === 0}
            onAddCreditButton={onAddCreditButton}
          />
          {errorContent}
        </Wrapper>
      </AccordionDetails>
      <Divider />
      <AccordionActions>
        <Button
          onClick={onSubmitClicked}
          disabled={firstname === "" || lastname === ""}
        >
          Submit
        </Button>
      </AccordionActions>
    </Accordion>
  );
};
