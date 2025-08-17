import { Booking } from "../models/booking.model.js";

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

// Additional helper function to get booking by ID
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

// Get bookings by user ID
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