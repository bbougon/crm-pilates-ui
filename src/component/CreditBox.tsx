import * as React from "react";
import {useState} from "react";
import {Box, Chip, ThemeProvider} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import {createTheme} from "@mui/material/styles";

type CreditBoxProps = {
    credit: number
}

const theme = createTheme({
    components: {
        MuiChip: {
            styleOverrides: {
                sizeSmall: {
                    height: 24,
                    width: 60
                }
            }
        }
    },
});

export const CreditBox = ({credit}: CreditBoxProps) => {

    const [creditAmountColor2] = useState<"default" | "primary" | "success" | "error" | "warning" | "secondary" | "info" | undefined>()

    const colorize = (): "success" | "error" | "warning" => {
        return credit < 1 ? "error" : credit < 3 ? "warning" : "success"
    }

    return <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end'
    }}>
        <ThemeProvider theme={theme}>
            <Chip size="small" label={credit} color={colorize()}
                  icon={<MonetizationOnIcon/>} sx={{
                fontWeight: 'bold'
            }}/>
        </ThemeProvider>
    </Box>;
}