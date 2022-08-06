export type TokenType = "bearer"

export interface Token {
    token: string
    type: TokenType
}