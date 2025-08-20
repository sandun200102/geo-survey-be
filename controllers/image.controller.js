import { Image } from "../models/image.model.js";

export const UploadImageWebsite = async (req, res) => {
    const { imageKey, bucketName } = req.body;
    try {
        // Validate the request body
        if (!imageKey || !bucketName ) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Check if the image already exists
        const imageAlreadyExists = await Image.findOne({ imageKey });
        if (imageAlreadyExists) {
            return res.status(400).json({ message: 'Image is already exists' });
        }

        // Create a new Image
        const image = new Image({
            imageKey,
            bucketName
        });
        await image.save();        
    
        res.status(200).json({ 
                success: true,
                message: 'Image uploaded successfully',
                image:{
                    ...image._doc,
                },
            });

    } catch (error) {
        console.error(error); // Add this line
        res.status(400).json({ message: 'Internal server error' });
    }
}