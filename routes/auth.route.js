import express from 'express';
import { Router } from 'express';
import { signup , login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth, googleLogin, updateUser, getUsers, removeUser, searchUsers, updateUserStatus, sendContactEmail, sendBookingEmail, updatePermission } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { uploadNewEquipment, updateEquipment , getAllEquipment, getEquipmentById, deleteEquipment, updateImageKey  } from '../controllers/equip.controller.js';
import {  isAdmin } from '../middleware/verifyAdmin.js';
import { upload, uploadFiles, getImage } from "../controllers/s3.controller.js";
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
router.get("/search-users",isAdmin, searchUsers);
router.patch("/update-user-status/:id", updateUserStatus);
router.delete("/remove-user/:id", removeUser);
router.post("/contact-email",sendContactEmail);
router.post("/booking-email",sendBookingEmail);
router.patch("/update-permission/:id", updatePermission);




router.post("/upload", upload.array("file"), uploadFiles);
router.get("/get-image/:key",getImage);


router.get('/get-all', getAllEquipment);
router.get('/get-one/:id', getEquipmentById);


// Admin-only protected routes
router.post('/upload-equipment', uploadNewEquipment);
router.put('/update-equipment/:id', updateEquipment);
router.put('/equipment-image-key/:id', updateImageKey);
router.delete('/delete-equipment/:id', deleteEquipment);


export default router;