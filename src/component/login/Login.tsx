import * as React from "react";
import { BaseSyntheticEvent, KeyboardEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainContainer } from "../../const/containers";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid,
  TextField,
} from "@mui/material";
import { useSelector } from "react-redux";
import { AuthStatus, login } from "../../features/auth";
import { RootState } from "../../app/store";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useAppDispatch } from "../../hooks/redux";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { display } = useSnackbar();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const status: AuthStatus = useSelector<RootState, AuthStatus>(
    (state) => state.login.status
  );

  const onUsernameChanged = (e: BaseSyntheticEvent) => {
    setUsername(e.target.value);
  };

  const onPasswordChanged = (e: BaseSyntheticEvent) => {
    setPassword(e.target.value);
  };

  const onLoginClicked = async () => {
    dispatch(login({ username, password }))
      .unwrap()
      .catch((err) => {
        display(err, "error");
      });
  };

  const onKeyDown = async (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      dispatch(login({ username, password }))
        .unwrap()
        .catch((err) => display(err, "error"));
    }
  };

  useEffect(() => {
    if (status === AuthStatus.SUCCEEDED) {
      navigate("/");
    }
  });

  return (
    <MainContainer>
      <Grid container alignContent="center" justifyContent="center">
        <Card>
          <CardHeader title="Login" component="div" />
          <CardContent>
            <Grid container rowSpacing={2}>
              <Grid container spacing={1} direction="row">
                <Grid item xs={12} md={6}>
                  <FormControl>
                    <TextField
                      className="sizeSmall"
                      aria-label="Username"
                      helperText="Username"
                      placeholder="Username"
                      required
                      variant="standard"
                      onChange={onUsernameChanged}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={1} direction="row">
                <Grid item xs={12} md={6}>
                  <FormControl>
                    <TextField
                      className="sizeSmall"
                      type="password"
                      aria-label="Password"
                      helperText="Password"
                      placeholder="Password"
                      required
                      variant="standard"
                      onChange={onPasswordChanged}
                      onKeyDown={onKeyDown}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={1} direction="row">
                <Grid
                  item
                  xs={12}
                  md={12}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button onClick={onLoginClicked}>Login</Button>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </MainContainer>
  );
};

export default Login;
