import { describe, expect, it } from "vitest";
import { AuthState, AuthStatus, getAuthToken } from "../auth";
import { RootState } from "../../app/store";

describe("Authentication reducer", () => {
  it("should check the token expiring date is not expired", async () => {
    sessionStorage.setItem(
      "token",
      JSON.stringify({
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZXJ0cmFuZCIsImV4cCI6MTY2MTM0NTI4Mn0.DZSLFT24Eu28ZusNFRDEbazfEpXCSJGEKWd4xGCaBfM",
        type: "bearer",
      })
    );
    const rootState: AuthState = {
      token: { token: "", type: "bearer" },
      status: AuthStatus.IDLE,
      error: [],
    };

    expect(getAuthToken({ login: rootState } as RootState)).toEqual({
      token: "",
      type: "bearer",
    });
  });

  it("should check the token expiration date in state", async () => {
    const rootState: AuthState = {
      token: {
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZXJ0cmFuZCIsImV4cCI6MTY2MTM0NTI4Mn0.DZSLFT24Eu28ZusNFRDEbazfEpXCSJGEKWd4xGCaBfM",
        type: "bearer",
      },
      status: AuthStatus.SUCCEEDED,
      error: [],
    };

    expect(getAuthToken({ login: rootState } as RootState)).toEqual({
      token: "",
      type: "bearer",
    });
  });
});
