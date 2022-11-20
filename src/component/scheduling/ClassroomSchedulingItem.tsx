import * as React from "react";
import { Box, Grid, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useMonthlyBody } from "@zach.codes/react-calendar";
import { ClassroomScheduling } from "./ClassroomScheduling";
import { useDrawer } from "../../hooks/useDrawer";
export const ClassroomSchedulingItem = () => {
  const { day } = useMonthlyBody();
  const { display } = useDrawer();

  return (
    <Grid container>
      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <IconButton
            onClick={() => display(<ClassroomScheduling date={day} />)}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  );
};
