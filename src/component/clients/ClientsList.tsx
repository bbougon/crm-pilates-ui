import * as React from "react";
import {useEffect, useState} from "react";
import {Avatar, Box, Grid, Typography} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {ClientStatus, fetchClients, selectAllClients} from "../../features/clientsSlice";
import PersonIcon from '@mui/icons-material/Person';
import {DisplayError} from "../errors/DisplayError";
import {ErrorMessage} from "../../features/errors";
import {RootState} from "../../app/store";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {Accordion, AccordionDetails, AccordionSummary} from "@material-ui/core";
import {Client, Credits} from "../../features/domain/client";
import {translate} from "../../utils/translation";
import styled from "styled-components";
import {CreditBox} from "../CreditBox";

type ClientDetailsAccordionSummaryProps = {
    client: Client
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: auto;
    width: 100%;
`;

const boxStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '6px 6px 6px 6px'
};

const ClientDetailsAccordionSummary = ({client}: ClientDetailsAccordionSummaryProps) => {
    const props = {
        expandIcon: <ExpandMoreIcon/>,
        sx: {textAlign: "center"},
        id: "panel1c-".concat(client.id).concat("-header")
    }
    return (
        <AccordionSummary {...props} aria-controls={"panel1c-".concat(client.id).concat("-content")}>
            <Grid container direction="row">
                    <Box sx={boxStyle}>
                        <Avatar sx={{width: 24, height: 24}}>
                            <PersonIcon/>
                        </Avatar>
                    </Box>
                    <Box sx={boxStyle}>
                        <Typography variant="h6">
                            {client.lastname}
                        </Typography>
                    </Box>
                    <Box sx={boxStyle}>
                        <Typography>
                            {client.firstname}
                        </Typography>
                    </Box>
            </Grid>
        </AccordionSummary>
    )
}

const CreditItem = (credit: Credits) => {
    const [credits] = useState(credit)
    return (
        <Grid container direction="row" sx={{
            paddingBottom: "4px"
        }}>
            <Grid item xs={2} sx={{
                display: 'flex',
                justifyContent: 'flex-start',
            }}>
                <Typography>{translate(credits.subject)}</Typography>
            </Grid>
            <Grid item xs={1}>
                <CreditBox credit={credits.value}/>
            </Grid>
        </Grid>
    )
}

const ClientItem = (client: Client) => {
    const credits = client.credits?.map(credit => (<CreditItem key={credit.subject} {...credit}/>))

    return (
        <Accordion>
            <ClientDetailsAccordionSummary client={client}/>
            <AccordionDetails>
                <Wrapper>
                    {credits}
                </Wrapper>
            </AccordionDetails>
        </Accordion>
    )
};

export const ClientsList = () => {

    const dispatch = useDispatch();
    const clients: Client[] = useSelector(selectAllClients);
    const error: ErrorMessage[] = useSelector<RootState, ErrorMessage[]>((state => state.clients.error))
    const status: ClientStatus = useSelector<RootState, ClientStatus>((state => state.clients.status))
    let content

    useEffect(() => {
        dispatch(fetchClients())
    }, [dispatch])

    content = clients.map((client) => (<ClientItem key={client.id} {...client}/>))
    if (status === ClientStatus.FAILED) {
        content = <DisplayError {...{error: error}}/>
    }

    return (
        <Grid container direction="column" sx={{paddingTop: "10px"}}>
            {content}
        </Grid>
    )

}
