import User from '../entity/user.entity';

export default interface UserInterface extends User {
  avatarUrl?: string;
}
