import * as React from "react";
import {useEffect} from "react";
import {Grid, Paper} from "@material-ui/core";
import {useDispatch, useSelector} from "react-redux";
import {fetchClients, selectAllClients} from "../../features/clientsSlice";


const Client = ({client}) => {
    return (
        <Grid item xs={2}>
            <Paper>{client.lastname} {client.firstname}</Paper>
        </Grid>
    )
};

export const ClientsList = () => {

    const dispatch = useDispatch();
    const clients = useSelector(selectAllClients);
    let content

    useEffect(() => {
        dispatch(fetchClients())
    }, [dispatch])

    content = clients.map((client) => (<Client key={client.id} client={client}/>))

    return (
        <Grid container>
            {content}
        </Grid>
    )

}
