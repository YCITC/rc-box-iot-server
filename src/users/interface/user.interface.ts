import User from '../entity/user.entity';

interface UserInterface extends User {
  avatarUrl?: string;
}

export default UserInterface;
