import * as React from "react";
import { ClientsList } from "./ClientsList";
import { AddClientForm } from "./ClientForm";
import { MainContainer } from "../../const/containers";
import { Grid } from "@mui/material";

export class Clients extends React.Component {
  render() {
    return (
      <MainContainer>
        <Grid container>
          <Grid item xs={11}>
            <>
              <AddClientForm />
            </>
          </Grid>
          <Grid item xs={11}>
            <>
              <ClientsList />
            </>
          </Grid>
        </Grid>
      </MainContainer>
    );
  }
}

export default Clients;
