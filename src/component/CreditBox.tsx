import * as React from "react";
import {useState} from "react";
import {Box, Chip, ThemeProvider} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import {createTheme} from "@mui/material/styles";

type CreditBoxProps = {
    credit: number | undefined
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

    const [creditAmountLabel2] = useState(credit ?? 0)
    const [creditAmountColor2] = useState<"default" | "primary" | "success" | "error" | "warning" | "secondary" | "info" | undefined>(creditAmountLabel2 < 1 ? "error" : creditAmountLabel2 < 3 ? "warning" : "success")

    return <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end'
    }}>
        <ThemeProvider theme={theme}>
            <Chip size="small" label={creditAmountLabel2} color={creditAmountColor2}
                  icon={<MonetizationOnIcon/>} sx={{
                fontWeight: 'bold'
            }}/>
        </ThemeProvider>
    </Box>;
}