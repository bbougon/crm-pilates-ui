import * as React from "react";
import { FC, createContext, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { Message } from "../features/errors";
import { createPortal } from "react-dom";
import { AlertColor } from "@mui/material/Alert/Alert";

export interface SnackbarAction {
  display: (
    messages: Message[],
    severity: "success" | "info" | "warning" | "error"
  ) => void;
}

const SnackbarContext = createContext<SnackbarAction>({ display: () => null });

export const SnackbarProvider: FC = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<Message[]>([]);
  const [severity, setSeverity] = useState<string>();

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider
      value={{
        display: (message: Message[], severity: string) => {
          setOpen(true);
          setError(message);
          setSeverity(severity);
        },
      }}
    >
      <div id="snack-portal"></div>
      {children}
      {open
        ? createPortal(
            <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
              <Alert severity={severity as AlertColor}>
                {error
                  .map((message) => `${message.origin} - ${message.message}`)
                  .join(";")}
              </Alert>
            </Snackbar>,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            document.getElementById("snack-portal")!
          )
        : null}
    </SnackbarContext.Provider>
  );
};

export default SnackbarContext;
