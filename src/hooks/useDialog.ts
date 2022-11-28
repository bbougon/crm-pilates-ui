import { useContext } from "react";
import DialogContext, { DialogAction } from "../context/DialogProvider";

export const useDialog = (): DialogAction => {
  return useContext(DialogContext);
};
