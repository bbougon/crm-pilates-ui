import {
    Accordion,
    AccordionActions,
    AccordionDetails,
    AccordionSummary,
    Button,
    Divider,
    FormControl,
    TextField,
    Typography
} from "@material-ui/core";
import * as React from "react";
import {useState} from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import styled from "styled-components";
import {useDispatch, useSelector} from "react-redux";
import {ClientStatus, createClient} from "../../features/clientsSlice";
import {DisplayError} from "../errors/DisplayError";
import {ErrorMessage} from "../../features/errors";
import {RootState} from "../../app/store";
import {Subjects} from "../../features/domain/subjects";
import {AddCreditButton} from "./AddCreditButton";
import {AddCreditForm} from "./AddCreditForm";
import {subjects} from "../../utils/translation";
import {CreditItem} from "./CreditItem";
import {Grid} from "@mui/material";


const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: auto;
    text-align: left;
    width: 100%;
`;

const AddClientAccordionSummary = () => {
    const props = {
        expandIcon: <ExpandMoreIcon/>,
        id: "panel1c-header"
    }
    return (
        <AccordionSummary {...props} aria-controls={"panel1c-content"}>
            <Typography variant="h6" color="textSecondary">Add a new client</Typography>
        </AccordionSummary>
    )
}

export const AddClientForm = () => {

    const dispatch = useDispatch()

    const errorMessages: ErrorMessage[] = useSelector<RootState, ErrorMessage[]>((state => state.clients.error))
    const status: ClientStatus = useSelector<RootState, ClientStatus>((state => state.clients.status))
    const [addCreditForms, setAddCreditForms] = useState<any>(undefined)
    const [creditItems, setCreditItems] = useState<any[]>([])
    const [availableSubjects, setAvailableSubjects] = useState<{subject: Subjects, title: string}[]>(subjects)
    const [addCreditsInProgress, setAddCreditsInProgress] = useState(false)
    let errorContent = undefined

    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [credits, setCredits] = useState<{ value: number, subject: string }[] | []>([])

    const onFirstnameChanged = (e: any) => setFirstname(e.target.value)
    const onLastnameChanged = (e: any) => setLastname(e.target.value)

    const onSubmitClicked = async () => {
        dispatch(createClient({firstname, lastname, credits}))
        setLastname('')
        setFirstname('')
        setCreditItems([])
    }

    const onAddCredits = (creditsAmount: number, subject: Subjects) => {
        setCredits([...credits, {value: creditsAmount as number, subject: subject}])
        setCreditItems([...creditItems,
            <Grid key={"credit-item-container-".concat(Math.random().toString())} container direction="row" sx={{
                paddingTop: '4px'
            }}>
                <CreditItem key={"credit-item".concat(Math.random().toString())}
                                                        credits={{value: creditsAmount, subject: subject}}/>
            </Grid>])
        setAddCreditForms(undefined)
        setAddCreditsInProgress(false)
        setAvailableSubjects(availableSubjects.filter(currentSubject => subject !== currentSubject.subject))
    }

    const onAddCreditButton = () => {
        setAddCreditForms(<AddCreditForm key={`add-credit-form-`.concat(Math.random().toString())} subjects={availableSubjects}
                                         onAddCredits={onAddCredits}/>)
        setAddCreditsInProgress(true)
    }

    if (status === ClientStatus.CREATION_FAILED) {
        errorContent = (
            <Grid container>
                <Grid item xs={12} md={12}>
                    <DisplayError {...{error: errorMessages}}/>
                </Grid>
            </Grid>
        )
    }

    return (
        <Accordion>
            <AddClientAccordionSummary/>
            <AccordionDetails>
                <Wrapper>
                    <Grid container>
                        <Grid item xs={12} md={3}>
                            <FormControl>
                                <TextField id="client-name" className="sizeSmall"
                                           label="Client's name"
                                           helperText="Provide a client's name"
                                           required
                                           onChange={onLastnameChanged}
                                           aria-describedby="client-name-help"
                                           value={lastname}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl>
                                <TextField id="client-first-name" className="sizeSmall"
                                           label="Client's firstname"
                                           helperText="Provide a client's firstname"
                                           required
                                           onChange={onFirstnameChanged}
                                           aria-describedby="client-first-name-help"
                                           value={firstname}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid key={"credits-items-".concat(Math.random().toString())} container direction="column">
                        {creditItems}
                    </Grid>
                    {addCreditForms}
                    <AddCreditButton key={`add-credit-buton-`.concat(Math.random().toString())}
                                     disabled={addCreditsInProgress || availableSubjects.length === 0} onAddCreditButton={onAddCreditButton}/>
                    {errorContent}
                </Wrapper>
            </AccordionDetails>
            <Divider/>
            <AccordionActions>
                <Button onClick={onSubmitClicked} disabled={firstname === "" || lastname === ""}>Submit</Button>
            </AccordionActions>
        </Accordion>
    );

}
