import * as React from "react";
import {MainContainer} from "../../const/containers";
import {Grid} from "@material-ui/core";
import {AddClientForm} from "./addClientForm";
import {ClientsList} from "./clientsList";


export class Clients extends React.Component {


    render() {
        return (
            <MainContainer>
                <Grid container>
                    <Grid item xs={11}>
                        <>
                            <AddClientForm />
                        </>
                    </Grid>
                    <Grid item xs={11}>
                        <>
                            <ClientsList />
                        </>
                    </Grid>
                </Grid>
            </MainContainer>
        );
    }
}

export default Clients;