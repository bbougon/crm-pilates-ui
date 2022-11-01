export type TokenType = "bearer";

export interface Token {
  token: string | null;
  type: TokenType;
}
