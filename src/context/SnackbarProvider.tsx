import * as React from "react";
import { FC, createContext, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { ErrorMessage } from "../features/errors";
import { createPortal } from "react-dom";

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
      <div id="error-portal"></div>
      {children}
      {open
        ? createPortal(
            <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
              <Alert severity="error">
                {error
                  .map((error) => `${error.message} - ${error.origin}`)
                  .join(";")}
              </Alert>
            </Snackbar>,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            document.getElementById("error-portal")!
          )
        : null}
    </SnackbarContext.Provider>
  );
};

export default SnackbarContext;
