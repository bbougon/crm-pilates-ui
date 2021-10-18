import * as React from "react";
import {Box, IconButton} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

export const AddClassroomItem = () => {
    return(
        <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end'
        }}>
            <IconButton>
                <AddIcon fontSize="small" />
            </IconButton>
        </Box>

    )
}