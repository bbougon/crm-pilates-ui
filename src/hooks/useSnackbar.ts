import {useContext} from "react";
import SnackbarContext, {SnackbarAction} from "../context/SnackbarProvider";

export const useSnackbar = (): SnackbarAction => {
    return useContext(SnackbarContext)
}