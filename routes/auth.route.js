import express from 'express';
import { Router } from 'express';
import { signup , login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth, googleLogin, updateUser, getUsers, removeUser } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { uploadNewEquipment, updateEquipment , getAllEquipment, getEquipmentById, deleteEquipment  } from '../controllers/equip.controller.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';
const router = Router();

router.get("/check-auth",verifyToken,checkAuth);
// router.get("/update-profile",verifyToken,updateProfile);

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleLogin);
router.put('/update/:id', updateUser);
router.post("/verify-email",verifyEmail);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password/:token",resetPassword)
router.delete('/remove-user/:id', removeUser);
router.get('/get-users', getUsers);



router.get('/get-all', getAllEquipment);
router.get('/get-one/:id', getEquipmentById);

// Admin-only protected routes
router.post('/upload-equipment', uploadNewEquipment);
router.put('/update-equipment/:id', updateEquipment);
router.delete('/delete-equipment/:id', deleteEquipment);



export default router;