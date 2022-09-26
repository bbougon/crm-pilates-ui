import {Session} from "../../features/domain/session";
import {Box, Card, ClickAwayListener, Drawer} from "@mui/material";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {SessionDetails} from "../classroom/SessionDetails";
import * as React from "react";


const theme = createTheme({
    typography: {
        h5: {
            fontSize: "0.9rem",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontWeight: 800,
            lineHeight: 1.334,
            letterSpacing: "0em",
            textTransform: "uppercase"
        },
        body1: {
            fontSize: "0.8rem",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: "0em",
        },
        fontSize: 12
    },
    components: {
        MuiChip: {
            styleOverrides: {
                sizeSmall: {
                    height: 24
                }
            }
        }
    },
});

export const MyPopper = ({
                             closeSessionDisplay,
                             session,
                         }: { closeSessionDisplay: () => void, session: Session }) => {
    return (
        <Drawer anchor="right" open={true}>
            <ThemeProvider theme={theme}>
                <Card sx={{minWidth: 500, maxWidth: 600, display: 'flex'}}>
                    <ClickAwayListener onClickAway={closeSessionDisplay}
                                       disableReactTree={false}>

                        <Box sx={{width: 1, display: 'flex', flexDirection: 'column'}}>
                            <SessionDetails {...session}/>
                        </Box>
                    </ClickAwayListener>
                </Card>
            </ThemeProvider>
        </Drawer>
    );
}