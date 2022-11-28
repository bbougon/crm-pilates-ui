import { Credits } from "../../features/domain/client";
import { Grid, Typography } from "@mui/material";
import { translate } from "../../utils/translation";
import { CreditBox } from "../CreditBox";
import * as React from "react";

type CreditItemProps = {
  credits: Credits | undefined;
};
export const CreditItem = ({ credits }: CreditItemProps) => {
  return (
    <>
      <Grid
        item
        sm={3}
        xs={6}
        sx={{
          spacing: "0",
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <Typography>{translate(credits?.subject)}</Typography>
      </Grid>
      <Grid
        item
        sm={9}
        xs={6}
        sx={{
          spacing: "0",
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <CreditBox credit={credits?.value || 0} />
      </Grid>
    </>
  );
};
