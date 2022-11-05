import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import * as React from "react";
import { ErrorMessage } from "../../features/errors";

const theme = createTheme({
  typography: {
    h5: {
      fontSize: "0.7rem",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 800,
      lineHeight: 1.334,
      letterSpacing: "0em",
    },
    fontSize: 10,
  },
});

interface DisplayErrorProps {
  error: ErrorMessage[];
}

export const DisplayError = ({ error }: DisplayErrorProps) => {
  const errorMessage = error?.map((error) => {
    return (
      <Stack key={Math.random()}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <ThemeProvider theme={theme}>
            <Typography>[{error.origin}]</Typography>
          </ThemeProvider>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <ThemeProvider theme={theme}>
            <Typography>{error.message}</Typography>
          </ThemeProvider>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <ThemeProvider theme={theme}>
            <Typography>{error.type}</Typography>
          </ThemeProvider>
        </Stack>
      </Stack>
    );
  });
  return (
    <Grid item xs={12}>
      <Card>
        <CardContent sx={{ color: "error.main", fontSize: "xx-small" }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", fontSize: "xx-small" }}
          >
            <ThemeProvider theme={theme}>
              <Typography variant="h5">
                An error occurred (see message below):
              </Typography>
            </ThemeProvider>
          </Stack>
          {errorMessage}
        </CardContent>
      </Card>
    </Grid>
  );
};
