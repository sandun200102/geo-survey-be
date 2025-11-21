import express from 'express';
import { Router } from 'express';
import { signup , login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth, googleLogin, updateUser, getUsers, removeUser, searchUsers, updateUserStatus, sendContactEmail, updateRole } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { uploadNewEquipment, updateEquipment , getAllEquipment, getEquipmentById, deleteEquipment, updateImageKey  } from '../controllers/equip.controller.js';
import { createBooking, getAllBookings, updateBookingStatus, getBookingById, getBookingsByUserId, sendBookingEmail, updatePermission, sendPermissionEmail, sendPermissionEmailToUser, sendBookingConfirmedEmail, updateUserBookingStatus} from "../controllers/booking.controller.js";
import {  isAdmin } from '../middleware/verifyAdmin.js';
import { upload, uploadFiles, getImage } from "../controllers/s3.controller.js";
import { UploadImageWebsite } from "../controllers/image.controller.js";
import { AddNewLmsUser, addCourseToUser, getLmsUserByUserID} from "../controllers/lmsUser.controller.js";



const router = Router();

router.get("/check-auth",verifyToken,checkAuth);

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
router.post("/permission-email",sendPermissionEmail);
router.post("/permission-email-to-user",sendPermissionEmailToUser);
router.post("/booking-confirmed-email",sendBookingConfirmedEmail);
router.patch("/update-permission/:id", updatePermission);
router.patch("/update-role/:id", updateRole);


router.post("/upload", upload.array("file"), uploadFiles);
router.get("/get-image/:key",getImage);


router.get('/get-all', getAllEquipment);
router.get('/get-one/:id', getEquipmentById);
router.post('/upload-equipment', uploadNewEquipment);
router.put('/update-equipment/:id', updateEquipment);
router.put('/equipment-image-key/:id', updateImageKey);
router.delete('/delete-equipment/:id', deleteEquipment);



router.post('/create-booking', createBooking);
router.get('/get-all-bookings', getAllBookings);
router.get('/get-booking-id', getBookingById);
router.get('/get-booking-userid', getBookingsByUserId);
router.put('/update-booking-status/:id', updateBookingStatus);
router.patch('/update-user-booking-status/:id', updateUserBookingStatus);


router.post('/upload-images-website', UploadImageWebsite);


router.post('/add-new-lms-user', AddNewLmsUser);
router.put("/users/:userID/courses", addCourseToUser);
router.get("/users/by-userid/:userID", getLmsUserByUserID);




export default router;