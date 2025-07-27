import express from 'express';
import { Router } from 'express';
import { signup , login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth, googleLogin  } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();

router.get("/check-auth",verifyToken,checkAuth);
// router.get("/update-profile",verifyToken,updateProfile);

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleLogin);


router.post("/verify-email",verifyEmail);
router.post("/forgot-password",forgotPassword);

router.post("/reset-password/:token",resetPassword)




export default router;