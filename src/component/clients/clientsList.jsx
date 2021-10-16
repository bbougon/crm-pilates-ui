import * as React from "react";
import {useEffect} from "react";
import {Card, Grid, Typography} from "@material-ui/core";
import {useDispatch, useSelector} from "react-redux";
import {fetchClients, selectAllClients} from "../../features/clientsSlice";
import {Avatar, CardContent, Stack} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';


const Client = ({client}) => {
    return (
        <Grid item xs={12}>
            <Card>
                <CardContent sx={{textAlign: "left"}}>
                    <Stack direction="row" spacing={2} sx={{alignItems: "center"}}>
                        <Avatar sx={{width: 24, height: 24}}>
                            <PersonIcon/>
                        </Avatar>
                        <Typography variant="h6" gutterBottom>
                            {client.lastname}
                        </Typography>
                        <Typography gutterBottom>
                            {client.firstname}
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>
        </Grid>
    )
};

export const displayError = (error) => {
    let errorMessage
    errorMessage = error.map((error) => {
        return (
            <div key={Math.random()}>
                <Stack direction="row" spacing={2} sx={{alignItems: "center"}}>
                    <Typography>{error.message}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} sx={{alignItems: "center"}}>
                    <Typography>{error.type}</Typography>
                </Stack>
            </div>
        )
    })
    return <Grid>
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} sx={{alignItems: "center"}}>
                    <Typography variant="h5">An error occurred (see message below):</Typography>
                </Stack>
                {errorMessage}
            </CardContent>
        </Card>
    </Grid>
}

export const ClientsList = () => {

    const dispatch = useDispatch();
    const clients = useSelector(selectAllClients);
    const error = useSelector((state => state.clients.error))
    const status = useSelector((state => state.clients.status))
    let content

    useEffect(() => {
        dispatch(fetchClients())
    }, [dispatch])

    content = clients.map((client) => (<Client key={client.id} client={client}/>))
    if (status === "failed") {
        content = displayError(error);
    }

    return (
        <Grid container spacing={1}>
            {content}
        </Grid>
    )

}
