import * as React from "react";
import {BaseSyntheticEvent, ReactElement, useEffect, useState} from "react";
import {Avatar, Box, FormControl, Grid, TextField, Typography} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {
    addCredits,
    ClientStatus,
    fetchClients,
    getClientById,
    getClientCredits,
    selectAllClients
} from "../../features/clientsSlice";
import PersonIcon from '@mui/icons-material/Person';
import {DisplayError} from "../errors/DisplayError";
import {ErrorMessage} from "../../features/errors";
import {RootState} from "../../app/store";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {Accordion, AccordionDetails, AccordionSummary, Button} from "@material-ui/core";
import {Client, Credits} from "../../features/domain/client";
import {subjects} from "../../utils/translation";
import styled from "styled-components";
import {Subjects} from "../../features/domain/subjects";
import {AddCreditButton} from "./AddCreditButton";
import {AddCreditForm} from "./AddCreditForm";
import {CreditItem} from "./CreditItem";

type ClientDetailsAccordionSummaryProps = {
    client: Client | undefined
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
        id: "panel1c-".concat(client?.id || Math.random().toString()).concat("-header")
    }
    return (
        <AccordionSummary {...props} aria-controls={"panel1c-".concat(client?.id || Math.random().toString()).concat("-content")}>
            <Grid container direction="row">
                <Box sx={boxStyle}>
                    <Avatar sx={{width: 24, height: 24}}>
                        <PersonIcon/>
                    </Avatar>
                </Box>
                <Box sx={boxStyle}>
                    <Typography variant="h6">
                        {client?.lastname}
                    </Typography>
                </Box>
                <Box sx={boxStyle}>
                    <Typography>
                        {client?.firstname}
                    </Typography>
                </Box>
            </Grid>
        </AccordionSummary>
    )
}

type CreditItemFormProps = {
    credit: Credits
    clientId: string
}

const CreditItemForm = ({credit, clientId}: CreditItemFormProps) => {
    const dispatch = useDispatch()
    const credits: Credits | undefined = useSelector(getClientCredits(clientId, credit.subject))
    const [creditsAmount, setCreditsAmount] = useState<number | null>(null)

    const onCreditsAmountChanged = (e: BaseSyntheticEvent) => {
        setCreditsAmount(e.target.value)
    }

    const onSubmitClicked = async () => {
        if (creditsAmount && credits) {
            const value: number = +creditsAmount
            dispatch(addCredits({clientId, creditsAmount: value, subject: credits.subject}))
            setCreditsAmount(0)
        }
    }

    return (
        <Grid container direction="row" sx={{
            paddingBottom: "4px",
            alignItems: "center"
        }}>
            <CreditItem credits={credits} />
            <Grid item xs={9}>
                <Grid container direction="row" sx={{'& button': {m: 2}}}>
                    <Grid item xs={1}/>
                    <Grid item xs={3} sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        paddingLeft: '16px',
                        paddingBottom: '12px'
                    }}
                    >
                        <FormControl>
                            <TextField id={`credits-amount-`.concat(Math.random().toString())}
                                       error={creditsAmount ? creditsAmount < 1 : false}
                                       size="small"
                                       type="number"
                                       label="Amount of credits"
                                       required
                                       variant="standard"
                                       onChange={onCreditsAmountChanged}
                                       value={creditsAmount || ""}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={5} sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                    }}>
                        <Button size="small" disabled={creditsAmount === null || creditsAmount < 1}
                                onClick={onSubmitClicked}>Add credits</Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

type ClientItemProps = {
    clientId: string
}

const ClientItem = ({clientId}: ClientItemProps) => {

    const client:Client | undefined = useSelector(getClientById(clientId))
    const [addForm, setAddForm] = useState<ReactElement | undefined>(undefined)
    const dispatch = useDispatch()

    const onAddCredits = (creditsAmount: number, subject: Subjects) => {
        if (creditsAmount && client) {
            const value: number = +creditsAmount
            dispatch(addCredits({clientId: client.id, creditsAmount: value, subject}))
            setAddForm(undefined)
        }
    }

    const onAddCreditButton = () => {
        setAddForm(<AddCreditForm key={`add-credit-form-`.concat(Math.random().toString())} subjects={
            subjects.filter(subject => !(client?.credits?.map(credits => credits.subject) || []).includes(subject.subject))
        } onAddCredits={onAddCredits}/>)
    }

    return (
        <Accordion>
            <ClientDetailsAccordionSummary client={client}/>
            <AccordionDetails>
                <Wrapper>
                    {
                        client?.credits?.map(credit => (
                            <CreditItemForm key={credit.subject} clientId={client?.id} credit={credit}/>)) || []
                    }
                    {addForm}
                    <AddCreditButton key={`add-credit-button-`.concat(client?.id || Math.random().toString())} disabled={
                        Object.keys(Subjects)
                            .every(subject => client?.credits?.map(credits => credits.subject)
                                .includes(subject as Subjects))
                    } onAddCreditButton={onAddCreditButton}/>
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

    content = clients.map((client) => (<ClientItem key={client.id} clientId={client.id} />))
    if (status === ClientStatus.FAILED) {
        content = <DisplayError {...{error: error}}/>
    }

    return (
        <Grid container direction="column" sx={{paddingTop: "10px"}}>
            {content}
        </Grid>
    )

}
