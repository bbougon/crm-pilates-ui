import * as React from "react";
import {BaseSyntheticEvent, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {MainContainer} from "../../const/containers";
import {FormControl} from "@material-ui/core";
import {Button, Card, CardContent, CardHeader, Grid, TextField} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {login, LoginStatus} from "../../features/login";
import {RootState} from "../../app/store";
import {DisplayError} from "../errors/DisplayError";
import {ErrorMessage} from "../../features/errors";

const Login = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate()

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const errorMessages: ErrorMessage[] = useSelector<RootState, ErrorMessage[]>((state => state.login.error))
    const status: LoginStatus = useSelector<RootState, LoginStatus>((state => state.login.status))
    let errorContent = undefined

    const onUsernameChanged = (e: BaseSyntheticEvent) => {
        setUsername(e.target.value)
    }

    const onPasswordChanged = (e: BaseSyntheticEvent) => {
        setPassword(e.target.value)
    }

    const onLoginClicked = async () => {
        await dispatch(login({username, password}))
    }

    useEffect(() => {
        if (status === LoginStatus.SUCCEEDED) {
            navigate("/")
        }
    })


    if (status === LoginStatus.FAILED) {
        errorContent = (
            <Grid container>
                <Grid item xs={12} md={12}>
                    <DisplayError {...{error: errorMessages}}/>
                </Grid>
            </Grid>
        )
    }

    return (
        <MainContainer>
            <Grid container>
                <Card>
                    <CardHeader title="Login" component="div"/>
                    <CardContent>
                        <Grid container rowSpacing={2}>
                            <Grid container spacing={1} direction="row">
                                <Grid item xs={12} md={6}>
                                    <FormControl>
                                        <TextField id="username" className="sizeSmall"
                                                   label="Username"
                                                   helperText="Username"
                                                   required
                                                   variant="standard"
                                                   onChange={onUsernameChanged}
                                                   aria-describedby="username-help"
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container spacing={1} direction="row">
                                <Grid item xs={12} md={6}>
                                    <FormControl>
                                        <TextField id="password" className="sizeSmall"
                                                   type="password"
                                                   label="Password"
                                                   helperText="Password"
                                                   required
                                                   variant="standard"
                                                   onChange={onPasswordChanged}
                                                   aria-describedby="password-help"
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container spacing={1} direction="row">
                                <Grid item xs={12} md={12} sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                }}>
                                    <Button onClick={onLoginClicked}>Login</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                {errorContent}
            </Grid>
        </MainContainer>
    )

}

export default Login

