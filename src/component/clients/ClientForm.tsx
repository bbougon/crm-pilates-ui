import * as React from "react";
import { useReducer } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import styled from "styled-components";
import { createClient } from "../../features/clientsSlice";
import { Subjects } from "../../features/domain/subjects";
import { AddCreditButton } from "./AddCreditButton";
import { subjects } from "../../utils/translation";
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
import { useAppDispatch } from "../../hooks/redux";
import {
  addClientReducer,
  addCreditChanged,
  clientCreated,
  creditsAdded,
  updateFirstname,
  updateLastname,
} from "./reducer";
import { useSnackbar } from "../../hooks/useSnackbar";

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
  const dispatch = useAppDispatch();
  const { display } = useSnackbar();

  const [state, dispatchReducer] = useReducer(addClientReducer, {
    lastname: "",
    firstname: "",
    credits: [],
    creditsItems: [],
    availableSubjects: subjects,
    addCreditForm: undefined,
  });

  const onSubmitClicked = async () => {
    dispatch(
      createClient({
        firstname: state.firstname,
        lastname: state.lastname,
        credits: state.credits,
      })
    )
      .unwrap()
      .catch((err) => {
        display(err, "error");
      })
      .then((result) => {
        if (result !== undefined) {
          dispatchReducer(clientCreated());
          display(
            [
              {
                message: "Client created successfully",
                origin: "Client creation",
              },
            ],
            "success"
          );
        }
      });
  };

  const onAddCredits = (creditsAmount: number, subject: Subjects) => {
    dispatchReducer(
      creditsAdded({ value: creditsAmount as number, subject: subject })
    );
  };

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
                  onChange={(e) =>
                    dispatchReducer(updateLastname(e.target.value))
                  }
                  value={state.lastname}
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
                  onChange={(e) =>
                    dispatchReducer(updateFirstname(e.target.value))
                  }
                  value={state.firstname}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid
            key={"credits-items-".concat(Math.random().toString())}
            container
            direction="column"
          >
            {state.creditsItems}
          </Grid>
          {state.addCreditForm}
          <AddCreditButton
            key={`add-credit-button-`.concat(Math.random().toString())}
            disabled={
              state.addCreditForm !== undefined ||
              state.availableSubjects.length === 0
            }
            onAddCreditButton={() =>
              dispatchReducer(addCreditChanged(onAddCredits))
            }
          />
        </Wrapper>
      </AccordionDetails>
      <Divider />
      <AccordionActions>
        <Button
          onClick={onSubmitClicked}
          disabled={state.firstname === "" || state.lastname === ""}
        >
          Submit
        </Button>
      </AccordionActions>
    </Accordion>
  );
};
