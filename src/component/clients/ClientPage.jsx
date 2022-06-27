import * as React from "react";
import {Grid} from "@material-ui/core";
import {ClientsList} from "./ClientsList";
import {AddClientForm} from "./ClientForm";
import {MainContainer} from "../../const/containers";


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