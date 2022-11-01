import * as React from "react";
import { createContext, FC, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { ErrorMessage } from "../features/errors";

export interface SnackbarAction {
  display: (error: ErrorMessage[]) => void;
}

const SnackbarContext = createContext<SnackbarAction>({ display: () => null });

export const SnackbarProvider: FC = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<ErrorMessage[]>([]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider
      value={{
        display: (error: ErrorMessage[]) => {
          setOpen(true);
          setError(error);
        },
      }}
    >
      {children}
      <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
        <Alert severity="error">
          {error.map((error) => `${error.message} - ${error.origin}`).join(";")}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export default SnackbarContext;
