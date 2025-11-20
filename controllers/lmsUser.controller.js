import crypto from 'crypto';
import { LmsUser } from '../models/lmsUsers.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const lmsGoogleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await LmsUser.findOne({ email: payload.email });
    const splitName = payload.name.split(' '); // Split full name into first and last

    if (!user) {
      user = new LmsUser({
        googleId: payload.sub,
        firstName: splitName[0],
        lastName: splitName[1],
        email: payload.email,
        password: crypto.randomBytes(16).toString('hex'), // Generate a random password
        isAdmin: false,
        isVerified: true, // Google users are considered verified
        role: 'student',
      });
      await user.save();
      
    }

    res.json({ message: 'User authenticated', user });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const lmsLogout = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ 
        success: true,
        message: 'Logged out successfully' 
    });
}

export const lmsCheckAuth = async (req, res) => {
    try {
        const user = await LmsUser.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in checkAuth ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};


export const lmsUpdateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status. Must be 'active' or 'inactive'" });
        }

        // Prevent admin from deactivating themselves
        if (id === req.userId && status === 'inactive') {
            return res.status(400).json({ success: false, message: "Cannot deactivate your own account" });
        }

        const updatedUser = await LmsUser.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: `User status updated to ${status}`,
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error in updateUserStatus: ", error);
        res.status(500).json({ success: false, message: "Failed to update user status" });
    }
};

export const lmsRemoveUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (id === req.userId) {
            return res.status(400).json({ success: false, message: "Cannot delete your own account" });
        }

        const deletedUser = await LmsUser.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "User removed successfully",
            deletedUser: { ...deletedUser._doc, password: undefined },
        });
    } catch (error) {
        console.error("Error in removeUser: ", error);
        res.status(500).json({ success: false, message: "Failed to remove user" });
    }
};


export const getLmsUserByUserID = async (req, res) => {
  try {
    const { userID } = req.params;

    const user = await LmsUser.findOne({ userID }).select("-password");
    // Exclude password for security

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("getUserByUserID error:", error);
    res.status(500).json({ message: "Error retrieving user" });
  }
};


export const AddNewLmsUser = async (req, res) => {
    const { firstName, lastName, userID, email, password } = req.body;
    try {
        // Validate the request body
        if (!firstName || !lastName || !userID || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Check if the equipment already exists
        const userExists = await LmsUser.findOne({ userID });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new equipment
        const user = new LmsUser({
            firstName,
            lastName,
            userID,
            email,
            password
        });
        await user.save();        
    
        res.status(200).json({ 
                success: true,
                message: 'User add successfully',
                user:{
                    ...user._doc,
                },
            });

    } catch (error) {
        console.error(error); // Add this line
        res.status(400).json({ message: 'Internal server error' });
    }
}


export const addCourseToUser = async (req, res) => {
    const { userID } = req.params;   // user identifier from URL
    const { course } = req.body;     // single course string from body

    try {
        if (!course || typeof course !== "string") {
            return res.status(400).json({ message: "Course must be a string" });
        }

        // Add course if not already present
        const user = await LmsUser.findOneAndUpdate(
            { userID },
            { $addToSet: { courses: course }, updatedAt: new Date() },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Course added successfully",
            user: {
                ...user._doc,
                password: undefined // hide password
            }
        });

    } catch (error) {
        console.error("addCourseToUser error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


