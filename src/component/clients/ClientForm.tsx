import {
    Accordion,
    AccordionActions,
    AccordionDetails,
    AccordionSummary,
    Button,
    Divider,
    FormControl,
    Grid,
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


const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: auto;
    width: 100%;
`;

const ClientAccordionSummary = () => {
    const props = {
        expandIcon: <ExpandMoreIcon/>,
        sx: {textAlign: "center"},
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
    let errorContent = undefined

    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')

    const onFirstnameChanged = (e: any) => setFirstname(e.target.value)
    const onLastnameChanged = (e: any) => setLastname(e.target.value)

    const onSubmitClicked = async () => {
        dispatch(createClient({firstname, lastname}))
        setLastname('')
        setFirstname('')
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
            <ClientAccordionSummary/>
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
                    </Grid>
                    <Grid container>
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