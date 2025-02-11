import { Router } from 'express';
import {
  createUser,
  getUser,
  getUsers,
  
} from '../controllers/user.controller';
const userRoute = Router();
userRoute.post('', createUser);
userRoute.get('', getUsers);
userRoute.get('/:userid', getUser);
export default userRoute;