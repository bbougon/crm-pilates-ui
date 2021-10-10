import {
    Accordion,
    AccordionActions,
    AccordionDetails,
    AccordionSummary,
    Button,
    Divider,
    FormControl,
    FormHelperText,
    Grid,
    Input,
    InputLabel,
    makeStyles,
    Typography
} from "@material-ui/core";
import * as React from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import styled from "styled-components";
import {useState} from "react";
import {useDispatch} from "react-redux";
import {createClient} from "../../features/clientsSlice";


const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex: auto;
    width: 100%;
    padding-left: 100px;
`;

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    icon: {
        verticalAlign: 'bottom',
        height: 20,
        width: 20,
    },
    details: {
        alignItems: 'center',
    },
    column: {
        flexBasis: '33.33%',
    },
    helper: {
        borderLeft: `2px solid ${theme.palette.divider}`,
        padding: theme.spacing(1, 2),
    },
    link: {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        '&:hover': {
            textDecoration: 'underline',
        },
    },
}));


function ClientAccordionSummary() {
    const classes = useStyles();
    return (
        <AccordionSummary
            expandIcon={<ExpandMoreIcon/>}
            aria-controls="panel1c-content"
            id="panel1c-header">
            <div className={classes.column}>
                <Typography className={classes.heading}>Client</Typography>
            </div>
            <div className={classes.column}>
                <Typography className={classes.secondaryHeading}>Add a new client</Typography>
            </div>
        </AccordionSummary>
    )
}

export const CreateClientForm = () => {

    const dispatch = useDispatch()

    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')

    const onFirstnameChanged = (e) => setFirstname(e.target.value)
    const onLastnameChanged = (e) => setLastname(e.target.value)

    const onSubmitClicked = async() => {
        await dispatch(createClient({firstname, lastname})).unwrap()
        setLastname('')
        setFirstname('')
    }

    return (
        <Accordion>
            <ClientAccordionSummary/>
            <AccordionDetails>
                <Wrapper>
                    <Grid container>
                        <Grid item xs={3}>
                            <FormControl>
                                <InputLabel htmlFor="client-name">Client's name</InputLabel>
                                <Input id="client-name" className="sizeSmall"
                                       onChange={onLastnameChanged}
                                       aria-describedby="client-name-help"/>
                                <FormHelperText id="client-name-help">Provide a client's name</FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs={3}>
                            <FormControl>
                                <InputLabel htmlFor="client-first-name">Client's firstname</InputLabel>
                                <Input id="client-first-name" className="sizeSmall"
                                       onChange={onFirstnameChanged}
                                       aria-describedby="client-first-name-help"/>
                                <FormHelperText id="client-first-name-help">Provide a client's
                                    firstname</FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Wrapper>
            </AccordionDetails>
            <Divider/>
            <AccordionActions>
                <Button onClick={onSubmitClicked}>Submit</Button>
            </AccordionActions>
        </Accordion>
    );

}
