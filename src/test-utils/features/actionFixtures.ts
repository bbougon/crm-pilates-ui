import { ErrorMessage } from "../../features/errors";

export class RejectedAction {
  private action: {
    type: string;
    payload?: ErrorMessage[];
  };

  constructor(type: any) {
    this.action = {
      type: type.rejected.type,
      payload: undefined,
    };
  }

  withStructuredPayload = (): RejectedAction => {
    this.action.payload = [
      {
        message: "an error message",
        type: "an error type",
        origin: "origin",
      },
    ];
    return this;
  };

  withErrorPayload = (
    payload: ErrorMessage[] = [
      { message: "error", type: "type", origin: "origin" },
    ]
  ): RejectedAction => {
    this.action.payload = payload;
    return this;
  };

  withoutPayload = (): RejectedAction => {
    this.action = {
      type: this.action.type,
    };
    return this;
  };

  build = (): {
    type: string;
    payload?: ErrorMessage[];
  } => this.action;
}

export class FulFilledAction {
  private readonly type: string;
  private payload?: Record<string, unknown>;

  constructor(type: any) {
    this.type = type.fulfilled.type;
  }

  withPayload = (payload: Record<string, unknown>) => {
    this.payload = payload;
    return this;
  };

  build = (): {
    type: string;
    payload?: Record<string, unknown>;
  } => ({
    type: this.type,
    payload: this.payload,
  });
}

export class IdleAction {
  private action: {
    type: string;
    payload: Record<string, unknown>;
  };

  constructor(type: any) {
    this.action = {
      type: type.pending().type,
      payload: {},
    };
  }

  build = (): {
    type: string;
    payload: Record<string, unknown>;
  } => this.action;
}
