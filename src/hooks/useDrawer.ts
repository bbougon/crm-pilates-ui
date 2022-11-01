import { useContext } from "react";
import DrawerContext, { DrawerAction } from "../context/DrawerProvider";

export const useDrawer = (): DrawerAction => {
  return useContext(DrawerContext);
};
