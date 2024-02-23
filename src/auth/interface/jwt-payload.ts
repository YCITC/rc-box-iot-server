import RolesEnum from '../../common/enum';
import TokenType from '../enum/token-type';

export default interface JwtPayload<T extends TokenType> {
  id: number;
  username: string;
  type: T;
  role?: RolesEnum;
  iat?: number;
}
