import * as React from "react";
import { FC, ReactElement, createContext, useState } from "react";
import { Box, Card, ClickAwayListener, Drawer } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { createPortal } from "react-dom";

export interface DrawerAction {
  display: (element: ReactElement) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerAction>({
  display: () => null,
  closeDrawer: () => null,
});

const theme = createTheme({
  typography: {
    h5: {
      fontSize: "0.9rem",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 800,
      lineHeight: 1.334,
      letterSpacing: "0em",
      textTransform: "uppercase",
    },
    body1: {
      fontSize: "0.8rem",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "0em",
    },
    fontSize: 12,
  },
  components: {
    MuiChip: {
      styleOverrides: {
        sizeSmall: {
          height: 24,
        },
      },
    },
  },
});

export const DrawProvider: FC = ({ children }) => {
  const [element, setElement] = useState<null | ReactElement>(null);

  return (
    <DrawerContext.Provider
      value={{
        display: (element: ReactElement) => setElement(element),
        closeDrawer: () => setElement(null),
      }}
    >
      <div id="portal"></div>
      {children}
      {element
        ? createPortal(
            <Drawer anchor="right" open={true}>
              <ThemeProvider theme={theme}>
                <Card sx={{ minWidth: 300, maxWidth: 600, display: "flex" }}>
                  <ClickAwayListener
                    onClickAway={() => setElement(null)}
                    disableReactTree={false}
                  >
                    <Box
                      sx={{
                        width: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {element}
                    </Box>
                  </ClickAwayListener>
                </Card>
              </ThemeProvider>
            </Drawer>,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            document.getElementById("portal")!
          )
        : null}
    </DrawerContext.Provider>
  );
};

export default DrawerContext;
