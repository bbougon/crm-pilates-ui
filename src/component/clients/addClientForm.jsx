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
import {clientStatuses, createClient} from "../../features/clientsSlice";
import {DisplayError} from "../errors/displayError";


const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: auto;
    width: 100%;
`;


function ClientAccordionSummary() {
    return (
        <AccordionSummary
            expandIcon={<ExpandMoreIcon/>}
            aria-controls="panel1c-content"
            id="panel1c-header"
            sx={{textAlign: "center"}}>
            <Typography variant="h6" color="textSecondary">Add a new client</Typography>
        </AccordionSummary>
    )
}

export const AddClientForm = () => {

    const dispatch = useDispatch()

    const error = useSelector((state => state.clients.error))
    const status = useSelector((state => state.clients.status))
    let errorContent = undefined

    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')

    const onFirstnameChanged = (e) => setFirstname(e.target.value)
    const onLastnameChanged = (e) => setLastname(e.target.value)

    const onSubmitClicked = async () => {
        await dispatch(createClient({firstname, lastname}))
        setLastname('')
        setFirstname('')
    }

    if (status === clientStatuses.CREATION_FAILED) {
        errorContent = (
            <Grid container>
                <Grid item xs={12} md={12}>
                    <DisplayError error={error}/>
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
