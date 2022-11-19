import { Client } from "../../features/domain/client";
import { Autocomplete, FormControl, TextField } from "@mui/material";
import * as React from "react";

export const AttendeeSelector = ({
  clients,
  onChange,
}: {
  clients: Client[];
  onChange: (value: Client[]) => void;
}) => {
  return (
    <FormControl fullWidth>
      <Autocomplete
        multiple
        id="attendees"
        options={clients}
        getOptionLabel={(option) => `${option.lastname} ${option.firstname}`}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Attendees"
            placeholder="Attendees"
          />
        )}
        onChange={(event, value) => {
          onChange(value);
        }}
      />
    </FormControl>
  );
};
