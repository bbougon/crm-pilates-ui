import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ApiClient, api } from "../api";
import map_action_thunk_error, { ApiError, ErrorMessage } from "./errors";
import { RootState } from "../app/store";
import { Client, Credits } from "./domain/client";
import { Subjects } from "./domain/subjects";

export enum ClientStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  CREATION_FAILED = "creationFailed",
}

export interface ClientState {
  clients: Client[];
  status:
    | ClientStatus.IDLE
    | ClientStatus.LOADING
    | ClientStatus.SUCCEEDED
    | ClientStatus.FAILED
    | ClientStatus.CREATION_FAILED;
  error: ErrorMessage[];
}

const initialState: ClientState = {
  clients: [],
  status: ClientStatus.IDLE,
  error: [],
};

export interface ClientCreation {
  firstname: string;
  lastname: string;
  credits: { value: number; subject: string }[] | [];
}

export const createClient = createAsyncThunk<
  ClientCreation,
  ClientCreation,
  { rejectValue: ApiError }
>("clients/create", async (client, thunkAPI) => {
  try {
    const { login } = thunkAPI.getState() as unknown as RootState;
    const response = await api("/clients", {
      customConfig: {
        body: JSON.stringify(client),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${login.token.token}`,
        },
      },
    });
    return response.data as ApiClient;
  } catch (e) {
    return thunkAPI.rejectWithValue(e as ApiError);
  }
});

export const fetchClients = createAsyncThunk<
  { clients: Client[] },
  undefined,
  { rejectValue: ErrorMessage[] }
>("clients/fetch", async (_, thunkAPI) => {
  try {
    const { login } = thunkAPI.getState() as unknown as RootState;
    const response = await api("/clients", {
      customConfig: {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${login.token.token}`,
        },
      },
    });
    return {
      clients: response.data.map((client: ApiClient) => mapClient(client)),
    };
  } catch (e: ApiError | unknown) {
    return thunkAPI.rejectWithValue(
      map_action_thunk_error("Clients could not be retrieved", e as ApiError)
    );
  }
});

export type ClientCredits = {
  clientId: string;
  creditsAmount: number;
  subject: string;
};

export const addCredits = createAsyncThunk<
  ClientCredits,
  ClientCredits,
  { rejectValue: ApiError }
>("clients/addCredits", async (credits, thunkApi) => {
  try {
    const { login } = thunkApi.getState() as unknown as RootState;
    const body = JSON.stringify([
      {
        subject: credits.subject,
        value: credits.creditsAmount,
      },
    ]);
    const customConfig = {
      body,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${login.token.token}`,
      },
    };
    await api(`/clients/${credits.clientId}/credits`, { customConfig });
    return credits;
  } catch (e: ApiError | unknown) {
    return thunkApi.rejectWithValue(e as ApiError);
  }
});

function mapCredits(credits: { value: number; subject: string }[] | []) {
  return credits?.map((value) => {
    return { value: value.value, subject: value.subject as Subjects };
  });
}

function mapClient(client: ApiClient): Client {
  return {
    id: client.id,
    firstname: client.firstname,
    lastname: client.lastname,
    credits: mapCredits(client.credits),
  };
}

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchClients.pending, (state, _) => {
        state.status = ClientStatus.LOADING;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = ClientStatus.SUCCEEDED;
        state.clients = action.payload.clients;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = ClientStatus.FAILED;
        state.error = action.payload as ErrorMessage[];
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.status = ClientStatus.SUCCEEDED;
        state.clients.push(mapClient(action.payload as ApiClient));
      })
      .addCase(createClient.rejected, (state, action) => {
        state.status = ClientStatus.CREATION_FAILED;
        state.error = map_action_thunk_error(
          "Add client",
          action.payload as ApiError
        );
      })
      .addCase(addCredits.pending, (state, _) => {
        state.status = ClientStatus.LOADING;
      })
      .addCase(addCredits.fulfilled, (state, action) => {
        state.status = ClientStatus.SUCCEEDED;
        const credits = action.payload as ClientCredits;
        const client: Client | undefined = state.clients.find(
          (client) => client.id === credits.clientId
        );
        const credit: Credits | undefined = client?.credits?.find(
          (credit) => credit.subject === credits.subject
        );
        if (credit) credit.value += credits.creditsAmount;
        else if (client)
          client.credits?.push({
            value: credits.creditsAmount,
            subject: credits.subject as Subjects,
          });
      })
      .addCase(addCredits.rejected, (state, action) => {
        state.status = ClientStatus.CREATION_FAILED;
        state.error = map_action_thunk_error(
          "Add credits",
          action.payload as ApiError
        );
      });
  },
});

export const selectAllClients = (state: RootState) => state.clients.clients;
export const getClientCredits =
  (clientId: string, subject: string) => (state: RootState) =>
    state.clients.clients
      .find((client) => client.id === clientId)
      ?.credits?.find((credits) => credits.subject === subject);
export const getClientById = (clientId: string) => (state: RootState) =>
  state.clients.clients.find((client) => client.id === clientId);

export default clientsSlice.reducer;
