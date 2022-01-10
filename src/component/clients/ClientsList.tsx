import * as React from "react";
import {useEffect, useState} from "react";
import {
    Avatar,
    Box,
    FormControl, FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';
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
import {subjects, translate} from "../../utils/translation";
import styled from "styled-components";
import {CreditBox} from "../CreditBox";
import {Subjects} from "../../features/domain/subjects";

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


type CreditItemProps = {
    credit: Credits
    clientId: string
}

const CreditItem = ({credit, clientId}: CreditItemProps) => {
    const dispatch = useDispatch()
    const credits: Credits | undefined = useSelector(getClientCredits(clientId, credit.subject))
    const [creditsAmount, setCreditsAmount] = useState<number | null>(null)

    const onCreditsAmountChanged = (e: any) => {
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
            <Grid item xs={2} sx={{
                display: 'flex',
                justifyContent: 'flex-start',
            }}>
                <Typography>{translate(credits?.subject)}</Typography>
            </Grid>
            <Grid item xs={1}>
                <CreditBox credit={credits?.value || 0}/>
            </Grid>
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
                        <Button size="small" disabled={creditsAmount === null || creditsAmount < 1} onClick={onSubmitClicked}>Add credits</Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

type AddCreditButtonProps = {
    onAddCreditButton: any
}

const AddCreditButton = ({onAddCreditButton}: AddCreditButtonProps) => {

    return (
        <Grid container direction="row" sx={{
            paddingBottom: "4px",
            alignItems: "center"
        }}>
            <Grid item xs={12} sx={{
                display: 'flex',
                justifyContent: 'flex-end',
            }}>
                <IconButton aria-label="add" onClick={onAddCreditButton}>
                    <AddBoxIcon/>
                </IconButton>
            </Grid>
        </Grid>
    )
}

type AddCreditFormProps = {
    client: Client | undefined
    onAddCredits: any
}

const AddCreditForm = ({client, onAddCredits}: AddCreditFormProps) => {

    const [subject, setSubject] = useState<Subjects | "">("")
    const [creditsAmount, setCreditsAmount] = useState<number | null>(null)
    let clientSubjects = client?.credits?.map(credits => credits.subject) || [];
    const availableSubjects = subjects.filter(subject => !clientSubjects.includes(subject.subject))

    const onSubjectChanged = (e: any) => setSubject(e.target.value)
    const onCreditsAmountChanged = (e: any) => setCreditsAmount(e.target.value)
    const onSubmitClicked = (e: any) => {
        onAddCredits(creditsAmount, subject)
    }

    return (
        <Grid container direction="row" sx={{
            paddingBottom: "4px",
            alignItems: "center"
        }}>
            <Grid item xs={2} sx={{
                display: 'flex',
                justifyContent: 'flex-start',
            }}>
                <FormControl fullWidth>
                    <InputLabel id="subject-select-label">Subject</InputLabel>
                    <Select
                        labelId="subject-select-label"
                        id="subject-select"
                        value={subject}
                        required
                        placeholder="Select a subject"
                        label="Subject"
                        variant="standard"
                        onChange={onSubjectChanged}
                        size="small"
                    >
                        {availableSubjects.map(subject => <MenuItem key={subject.subject}
                                                                    value={subject.subject}>{subject.title}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={4} sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                paddingLeft: '16px',
            }}
            >
                <FormControl>
                    <TextField id="credits-amount"
                               size="small"
                               type="number"
                               label="Amount of credits"
                               required
                               variant="standard"
                               onChange={onCreditsAmountChanged}
                               value={creditsAmount || ""}
                               aria-describedby="credits-amount-help"/>
                </FormControl>
            </Grid>
            <Grid item xs={5} sx={{
                display: 'flex',
                justifyContent: 'flex-start',
            }}>
                <Button size="small" onClick={onSubmitClicked}>Add credits</Button>
            </Grid>
        </Grid>
    )
}

type ClientItemProps = {
    clientId: string
}

const ClientItem = ({clientId}: ClientItemProps) => {

    const client:Client | undefined = useSelector(getClientById(clientId))
    const [addForm, setAddForm] = useState<any>(undefined)
    const dispatch = useDispatch()

    const onAddCredits = (creditsAmount: number, subject: Subjects) => {
        if (creditsAmount && client) {
            const value: number = +creditsAmount
            dispatch(addCredits({clientId: client.id, creditsAmount: value, subject}))
            setAddForm(undefined)
        }
    }

    const onAddCreditButton = () => {
        setAddForm(<AddCreditForm key={`add-credit-form-`.concat(Math.random().toString())} client={client} onAddCredits={onAddCredits}/>)
    }

    return (
        <Accordion>
            <ClientDetailsAccordionSummary client={client}/>
            <AccordionDetails>
                <Wrapper>
                    {
                        client?.credits?.map(credit => (
                            <CreditItem key={credit.subject} clientId={client?.id} credit={credit}/>)) || []
                    }
                    {addForm}
                    <AddCreditButton key={`add-credit-buton-`.concat(client?.id || Math.random().toString())} onAddCreditButton={onAddCreditButton}/>
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
