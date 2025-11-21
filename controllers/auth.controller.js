import crypto from 'crypto';
import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendVerificationEmailGoogle } from '../mailtrap/sendVerificationCodeEmail.js';
import { sendWelcomeEmailGoogle } from '../mailtrap/sendWelcomeEmail.js';
import { sendPasswordResetEmailGoogle } from '../mailtrap/forgetPasswordEmail.js';
import { resetPasswordSuccessEmailGoogle } from '../mailtrap/resetPasswordSuccess.js';
import { sendContactEmailGoogle } from '../mailtrap/sendContactEmail.js';
// import { sendBookingEmailGoogle } from '../mailtrap/sendBookingEmail.js';
// import { sendPermissionEmailGoogle } from '../mailtrap/sendPermissionEmail.js';
// import { sendPermissionEmailGoogleToUser } from '../mailtrap/sendPermissionEmailToUSer.js';
// import { sendBookingConfirmedEmailGoogle } from '../mailtrap/sendBookingConfirmedEmail.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });
    const splitName = payload.name.split(' '); // Split full name into first and last

    if (!user) {
      user = new User({
        googleId: payload.sub,
        firstName: splitName[0],
        lastName: splitName[1],
        email: payload.email,
        password: crypto.randomBytes(16).toString('hex'), // Generate a random password
        isAdmin: false,
        isVerified: true, // Google users are considered verified
        role: 'user',
      });
      await user.save();
      await sendWelcomeEmailGoogle(user.email, user.firstName);
      
    }

    res.json({ message: 'User authenticated', user });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const signup = async (req, res) => {
    const { email, password, firstName, lastName, contactNumber, address } = req.body;
    try {
        // Validate the request body
        if (!email || !password || !firstName || !lastName || !contactNumber || !address) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Check if the user already exists
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
         const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const user = new User({ 
            email, 
            password : hashedPassword, 
            firstName,
            lastName,
            contactNumber,
            address,
            role : 'user',
            isAdmin: false,
            verificationToken ,
            verificationTokenExpiresAt: Date.now() + 24*60*60*1000, // 24 hour

        });
        await user.save();

        //jwt
        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmailGoogle(user.email, verificationToken);
        res.status(200).json({ 
                success: true,
                message: 'User created successfully',
                user:{
                    ...user._doc,
                    password: undefined,
                },
            });

    } catch (error) {
        console.error(error); // Add this line
        res.status(400).json({ message: 'Internal server error' });
    }
}

export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await User.findOne({ 
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
        if (user.verificationTokenExpiresAt < Date.now()) {
            return res.status(400).json({ message: 'Verification code has expired' });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        // Send a welcome email
        // await sendWelcomeEmail(user.email, user.name);
        await sendWelcomeEmailGoogle(user.email, user.name);
        // Send a success response
        res.status(200).json({ 
            success: true,
            message: 'Email verified successfully',
            user:{
                ...user._doc,
                password: undefined,
            },
        
        });

    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(400).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
}


export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Generate a reset password token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
        await user.save();

        // Send the reset password email
        // await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
        await sendPasswordResetEmailGoogle(user.email, user.name, resetToken, process.env.CLIENT_URL);

        res.status(200).json({ 
            success: true,
            message: 'Reset password email sent successfully. Please check your inbox.', 
        });

    } catch (error) {
        console.error('Error sending reset password email:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }

}

export const login = async (req, res) => {
    const {email,password} = req.body;

    try{
        const user = await User.findOne({email});
        // check if user exists
        if(!user){
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        // check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                success: false,
                message: 'Invalid password'
            });
        }
        generateTokenAndSetCookie(res, user._id);
    
        //update last login time
        user.lastLogin = Date.now();
        await user.save();

        // Send a success response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    }catch (error){
        console.error('Error logging in:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }

}

export const logout = async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ 
        success: true,
        message: 'Logged out successfully' 
    });
}

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Find the user by the reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        });

        // Check if the token is valid and not expired
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash the new password and update the user
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        // await sendPasswordResetSuccessEmail(user.email);
        await resetPasswordSuccessEmailGoogle(user.email, user.name);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const updateUser = async (req, res) => {
  const { firstName,
        lastName,
        email: primaryEmail,
        secondaryEmail,
        contactNumber,
        secondaryContactNumber,
        address,
        bio } = req.body;
  const userId = req.params.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName,
        lastName,
        email: primaryEmail,
        secondaryEmail,
        contactNumber,
        secondaryContactNumber,
        address,
        bio },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user' });
  }
};


export const getUsers = async (req, res) => {
  try {
    const { email } = req.query;
    let query = {};

    if (email) {
      query.email = { $regex: new RegExp(email, "i") }; // case-insensitive match
    }

    const users = await User.find(query).select("-password");
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};


export const updateUserStatus = async (req, res) => {
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

		const updatedUser = await User.findByIdAndUpdate(
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


export const removeUser = async (req, res) => {
	try {
		const { id } = req.params;

		// Prevent admin from deleting themselves
		if (id === req.userId) {
			return res.status(400).json({ success: false, message: "Cannot delete your own account" });
		}

		const deletedUser = await User.findByIdAndDelete(id);

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


export const searchUsers = async (req, res) => {
  try {
    const user = await Equipment.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "user not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user" });
  }
};


export const sendContactEmail = async (req, res) => {
    const { 
          name, 
          email, 
          phone, 
          company, 
          projectType, 
          message
           } = req.body;
    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

    
        

        // Send the reset password email
        // await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
        await sendContactEmailGoogle(name, 
          email, 
          phone, 
          company, 
          projectType, 
          message);

        res.status(200).json({ 
            success: true,
            message: 'Contact email  sent successfully. Please check your inbox.', 
        });

    } catch (error) {
        console.error('Error sending Contact email:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};


// export const updateRole = async (req, res) => {
// 	try {
// 		const { id } = req.params;
// 		const { role } = req.body;

// 		if (!['admin'].includes(role)) {
// 			return res.status(400).json({ success: false, message: "Invalid status. Must be 'admin'" });
// 		}

// 		// Prevent admin from deactivating themselves
// 		if (id === req.userId && role === 'admin') {
// 			return res.status(400).json({ success: false, message: "Cannot make admin" });
// 		}

// 		const updatedUser = await User.findByIdAndUpdate(
// 			id,
// 			{ role },
// 			{ new: true, runValidators: true }
// 		).select("-password");

// 		if (!updatedUser) {
// 			return res.status(404).json({ success: false, message: "User not found" });
// 		}

// 		res.status(200).json({
// 			success: true,
// 			message: `User status updated to ${role}`,
// 			user: updatedUser,
// 		});
// 	} catch (error) {
// 		console.error("Error in updateUserStatus: ", error);
// 		res.status(500).json({ success: false, message: "Failed to update user status" });
// 	}
// };

export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const allowedRoles = ["user", "admin", "super-admin"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Allowed roles: user, admin, super-admin",
            });
        }

        const requestingUser = await User.findById(req.userId);
        const targetUser = await User.findById(id);

        if (!targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Role priority
        const priority = {
            "user": 1,
            "admin": 2,
            "super-admin": 3
        };

        // ==========================================
        // 1. User Permission Check
        // ==========================================
        if (requestingUser.role === "user") {
            return res.status(403).json({
                success: false,
                message: "Users cannot change roles",
            });
        }

        // ==========================================
        // 2. Admin cannot modify equal or higher roles
        // ==========================================
        if (requestingUser.role === "admin") {
            // cannot touch admin or super-admin
            if (priority[targetUser.role] >= priority["admin"]) {
                return res.status(403).json({
                    success: false,
                    message: "Admins can only modify users",
                });
            }

            // cannot assign super-admin
            if (role === "super-admin") {
                return res.status(403).json({
                    success: false,
                    message: "Admins cannot assign super-admin role",
                });
            }
        }

        // ==========================================
        // 3. Super-admin cannot remove own super-admin role
        // ==========================================
        if (requestingUser.role === "super-admin" && id === req.userId && role !== "super-admin") {
            return res.status(403).json({
                success: false,
                message: "Super admin cannot remove their own super-admin role",
            });
        }

        // ==========================================
        // 4. Apply update
        // ==========================================
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            user: updatedUser,
        });

    } catch (error) {
        console.error("Error updating role:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update user role",
        });
    }
};
