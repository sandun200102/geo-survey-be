import { Booking } from "../models/booking.model.js";
import { User } from "../models/user.model.js"
import { sendBookingConfirmedEmailGoogle } from "../mailtrap/sendBookingConfirmedEmail.js"
import { sendBookingEmailGoogle } from "../mailtrap/sendBookingEmail.js"
import { sendPermissionEmailGoogle } from "../mailtrap/sendPermissionEmail.js"
import { sendPermissionEmailGoogleToUser } from "../mailtrap/sendPermissionEmailToUser.js"



export const createBooking = async (req, res) => {
    const { 
        bookingId, 
        equipmentname, 
        equipmentId, 
        userId, 
        userName, 
        userEmail, 
        phone, 
        startDate, 
        endDate, 
        amount 
    } = req.body;

    try {
        // Validate the request body
        if (!equipmentname || !equipmentId || !userId || !userName || !userEmail || !phone || !startDate || !endDate || !amount) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the booking already exists (only if bookingId is provided)
        if (bookingId) {
            const bookingAlreadyExists = await Booking.findOne({ bookingId });
            if (bookingAlreadyExists) {
                return res.status(400).json({ message: 'Booking already exists' });
            }
        }

        // Create a new Booking
        const booking = new Booking({
            ...(bookingId && { bookingId }), // Only include bookingId if provided
            equipmentname,
            equipmentId,
            userId,
            userName,
            userEmail,
            phone,
            startDate,
            endDate,
            amount,
            status: 'pending' // Set default status
        });

        await booking.save();

        res.status(201).json({
            success: true,
            message: 'Booking is Pending....',
            booking: {
                ...booking._doc,
            },
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 }); // Sort by newest first
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            success: false,
            message: "Error fetching booking details..." 
        });
    }
};

export const updateBookingStatus = async (req, res) => {
    const { status, date } = req.body;
    const bookingId = req.params.id;

    try {
        // Validate status if provided
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (status && !validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid status. Valid statuses are: pending, confirmed, cancelled, completed' 
            });
        }

        const updatedBookingStatus = await Booking.findByIdAndUpdate(
            bookingId,
            { 
                ...(status && { status: status.toLowerCase() }),
                ...(date && { date }),
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!updatedBookingStatus) {
            return res.status(404).json({ 
                success: false,
                message: 'Booking not found....' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Booking status updated successfully',
            booking: updatedBookingStatus 
        });

    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating booking status..' 
        });
    }
};


export const getBookingById = async (req, res) => {
    const bookingId = req.params.id;

    try {
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            booking
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching booking details'
        });
    }
};


export const getBookingsByUserId = async (req, res) => {
    const userId = req.params.userId;

    try {
        const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user bookings'
        });
    }
}; 

 export const updatePermission = async (req, res) => {
	try {
		const { id } = req.params;
		const { permission } = req.body;

		if (!['null','accept','pending'].includes(permission)) {
			return res.status(400).json({ success: false, message: "Invalid status. Must be 'null' or 'accept' or 'pending'" });
		}
        
		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ permission },
			{ new: true, runValidators: true }
		).select("-password");

		if (!updatedUser) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		res.status(200).json({
			success: true,
			message: `User status updated to ${permission}`,
			user: updatedUser,
		});
	} catch (error) {
		console.error("Error in updateUserStatus: ", error);
		res.status(500).json({ success: false, message: "Failed to update user status" });
	}
};


export const sendBookingEmail = async (req, res) => {
    console.log("giyaaaaa");
    const { 
          name, 
          email ,
          phone, 
          startDate, 
          endDate, 
          notes,
          equipmentId,
          equipmentName

           } = req.body;
    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        await sendBookingEmailGoogle(name, email ,phone, startDate, endDate, notes, equipmentId, equipmentName);

        res.status(200).json({ 
            success: true,
            message: 'Booking request email  sent successfully. Please check your inbox.', 
        });

    } catch (error) {
        console.error('Error sending bookong request email:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }

};


export const sendPermissionEmail = async (req, res) => {
    const { 
          name, 
          email,
          projectId,
          projectName
           } = req.body;
    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        await sendPermissionEmailGoogle(name, email, projectId, projectName);

        res.status(200).json({ 
            success: true,
            message: 'Permission request email  sent successfully. Please check your inbox.', 
        });

    } catch (error) {
        console.error('Error sending permission request email:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }

};


export const sendPermissionEmailToUser = async (req, res) => {
    const { 
          name, 
          email,
          projectName
           } = req.body;
    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        await sendPermissionEmailGoogleToUser(name, email, projectName);

        res.status(200).json({ 
            success: true,
            message: 'Permission request email  sent successfully. Please check your inbox.', 
        });

    } catch (error) {
        console.error('Error sending permission request email:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }

};

export const sendBookingConfirmedEmail = async (req, res) => {
    const { 
           name, 
           email, 
           equipmentName, 
           startDate,
           endDate
           } = req.body;
    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        await sendBookingConfirmedEmailGoogle(name, email, equipmentName, startDate,endDate);

        res.status(200).json({ 
            success: true,
            message: 'Booking confirmed email  sent successfully. Please check your inbox.', 
        });

    } catch (error) {
        console.error('Error sending Booking confirmed email:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }

};

export const updateUserBookingStatus= async (req, res) => {
	try {
		const { id } = req.params;
		const { hasEquipmentBooked } = req.body;

	if (typeof hasEquipmentBooked !== "boolean") {
    return res.status(400).json({ success: false, message: "Status must be a boolean value" });
    }


		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ hasEquipmentBooked },
			{ new: true, runValidators: true }
		).select("-password");

		if (!updatedUser) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		res.status(200).json({
			success: true,
			message: `User booking status updated to ${hasEquipmentBooked}`,
			user: updatedUser,
		});
	} catch (error) {
		console.error("Error in update User booking Status: ", error);
		res.status(500).json({ success: false, message: "Failed to update user booking status" });
	}
};