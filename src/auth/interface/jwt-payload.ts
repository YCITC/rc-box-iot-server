import TokenType from '../enum/token-type';

export default interface JwtPayload<T extends TokenType> {
  id: number;
  username: string;
  type: T;
  iat?: number;
}
