import crypto from 'crypto';
import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendVerificationEmailGoogle } from '../mailtrap/sendVerificationCode.js';
import { sendWelcomeEmailGoogle } from '../mailtrap/sendWelcomeEmail.js';
import { sendPasswordResetEmailGoogle } from '../mailtrap/forgetPasswordEmail.js';
import { resetPasswordSuccessEmailGoogle } from '../mailtrap/resetPasswordSuccess.js';
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

    if (!user) {
      user = new User({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        password: crypto.randomBytes(16).toString('hex'), // Generate a random password
        isAdmin: false,
        isVerified: true, // Google users are considered verified
        role: 'user',
      });
      await user.save();
      await sendWelcomeEmailGoogle(user.email, user.name);

    }

    res.json({ message: 'User authenticated', user });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const signup = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        // Validate the request body
        if (!email || !password || !name) {
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
            name ,
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
        // if (user.verificationTokenExpiresAt < Date.now()) {
        //     return res.status(400).json({ message: 'Verification code has expired' });
        // }
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
}
