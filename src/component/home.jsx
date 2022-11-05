import * as React from "react";
import { MainContainer } from "../const/containers";
import { Grid } from "@mui/material";

export default class Home extends React.Component {
  render() {
    return (
      <MainContainer>
        <Grid container>
          <Grid item xs={11}>
            Welcome Home
          </Grid>
        </Grid>
      </MainContainer>
    );
  }
}
