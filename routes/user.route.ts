import { Router } from "express";
import { signupUser, getUser, getUsers,updateProfile ,loginUser,logoutUser,resetPassword,forgotPassword} from "../controllers/user.controller.js";
import upload from '../middlewares/multer.js';
import { authenticate } from '../middlewares/jwt.js';

const userRoute = Router();
userRoute.post('/signup', signupUser);
userRoute.get('', getUsers);
userRoute.get('/:userid', getUser);
userRoute.post('/login', loginUser);
userRoute.put("/update", authenticate,upload.single('profilePhoto'), updateProfile); 
userRoute.post('/reset-password', resetPassword);
userRoute.post('/forgot-password', forgotPassword);
userRoute.post('/logout', logoutUser);


export default userRoute;
