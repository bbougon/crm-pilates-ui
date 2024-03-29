import { Grid, IconButton } from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import * as React from "react";

type AddElementButtonProps = {
  onAddElementButton: () => void;
  disabled?: boolean;
};
export const AddElementButton = ({
  onAddElementButton,
  disabled,
}: AddElementButtonProps) => {
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
        xs={12}
        sx={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <IconButton
          aria-label="add"
          disabled={disabled}
          onClick={onAddElementButton}
        >
          <AddBoxIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};
