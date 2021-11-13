import * as React from "react";
import {useEffect} from "react";
import {Card, Grid, Typography} from "@material-ui/core";
import {useDispatch, useSelector} from "react-redux";
import {Client, ClientStatus, fetchClients, selectAllClients} from "../../features/clientsSlice";
import {Avatar, CardContent, Stack} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import {DisplayError} from "../errors/DisplayError";
import {ErrorMessage} from "../../features/errors";
import {RootState} from "../../app/store";


const ClientItem = (client: Client) => {
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
        <Grid container spacing={1}>
            {content}
        </Grid>
    )

}
