import * as React from "react";
import { FC, ReactElement, createContext, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { createPortal } from "react-dom";
import { AlertColor } from "@mui/material/Alert/Alert";

type DialogDisplay = {
  element: ReactElement;
  title: string;
  okAction: () => void;
  severity: "warning" | "info";
};

export interface DialogAction {
  display: (popoverDisplay: DialogDisplay) => void;
  closeModal: () => void;
}

const DialogContext = createContext<DialogAction>({
  display: () => null,
  closeModal: () => null,
});

export const DialogProvider: FC = ({ children }) => {
  const [dialogDisplay, setDialogDisplay] = useState<null | DialogDisplay>(
    null
  );

  const closeDialog = () => {
    setDialogDisplay(null);
  };

  const onAgree = () => {
    if (dialogDisplay) {
      dialogDisplay.okAction();
      setDialogDisplay(null);
    }
  };

  return (
    <DialogContext.Provider
      value={{
        display: (popoverDisplay: DialogDisplay) =>
          setDialogDisplay(popoverDisplay),
        closeModal: () => setDialogDisplay(null),
      }}
    >
      <div id="popover-portal"></div>
      {children}
      {dialogDisplay
        ? createPortal(
            <Dialog open={true} onClose={closeDialog}>
              <DialogTitle>
                <Alert severity={dialogDisplay.severity as AlertColor}>
                  <h6>{dialogDisplay.title} </h6>
                </Alert>
              </DialogTitle>
              <DialogContent>{dialogDisplay.element}</DialogContent>
              <DialogActions>
                <Button onClick={closeDialog}>Disagree</Button>
                <Button color={dialogDisplay.severity} onClick={onAgree}>
                  Agree
                </Button>
              </DialogActions>
            </Dialog>,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            document.getElementById("popover-portal")!
          )
        : null}
    </DialogContext.Provider>
  );
};

export default DialogContext;
