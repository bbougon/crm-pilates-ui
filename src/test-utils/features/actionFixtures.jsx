export function RejectedAction(type) {
  this.action = {
    type: type.rejected.type,
    payload: null,
  };

  this.withStructuredPayload = () => {
    this.action.payload = {
      detail: [
        {
          loc: ["a location"],
          msg: "an error message",
          type: "an error type",
        },
      ],
    };
    return this;
  };

  this.withErrorPayload = (
    payload = { detail: [{ msg: "error", type: "type" }] }
  ) => {
    this.action.payload = payload;
    return this;
  };

  this.withoutPayload = () => {
    this.action = {
      type: this.action.type,
    };
    return this;
  };

  this.build = () => this.action;
}

export function FulFilledAction(type) {
  this.action = {
    type: type.fulfilled.type,
    payload: {},
  };

  this.withPayload = (payload) => {
    this.action.payload = payload;
    return this;
  };

  this.withMeta = (meta) => {
    this.action.meta = meta;
    return this;
  };

  this.build = () => this.action;
}

export function IdleAction(type) {
  this.action = {
    type: type.pending.type,
    payload: {},
  };

  this.build = () => this.action;
}
