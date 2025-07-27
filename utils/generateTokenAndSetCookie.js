import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res,userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d', // Token expiration time
    });

    res.cookie('token', token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'Strict', // Prevents CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time (7 days)
    });
    return token;

}