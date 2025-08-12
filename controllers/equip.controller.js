import { Equipment } from "../models/equipment.model.js";

// Upload new equipment
export const uploadNewEquipment = async (req, res) => {
    const { name, category, status, location, value, description, equipmentId } = req.body;
    try {
        // Validate the request body
        if (!name || !category || !status || !location || !value || !description || !equipmentId) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Check if the equipment already exists
        const equipmentAlreadyExists = await Equipment.findOne({ equipmentId });
        if (equipmentAlreadyExists) {
            return res.status(400).json({ message: 'Equipment already exists' });
        }

        // Create a new equipment
        const equipment = new Equipment({
            name,
            category,
            status,
            location,
            value,
            description,
            equipmentId
        });
        await equipment.save();        
    
        res.status(200).json({ 
                success: true,
                message: 'Equipment uploaded successfully',
                equipment:{
                    ...equipment._doc,
                },
            });

    } catch (error) {
        console.error(error); // Add this line
        res.status(400).json({ message: 'Internal server error' });
    }
}


// Update equipment
export const updateEquipment = async (req, res) => {
  const {name,
        category,
        status,
        location,
        value,
        description,
        equipmentId
    } = req.body;
  const equipId = req.params.id;

  try {
    const updatedEquipment = await Equipment.findByIdAndUpdate(
      equipId,
      { name,
        category,
        status,
        location,
        value,
        description,
        equipmentId },
      { new: true }
    );

    if (!updatedEquipment) return res.status(404).json({ message: 'Equipment not found' });

    res.status(200).json({ updatedEquipment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating Equipment' });
  }
};

// Get all equipment
export const getAllEquipment = async (req, res) => {
  try {
    const equipments = await Equipment.find();
    res.status(200).json(equipments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching equipment" });
  }
};

// Get equipment by ID
export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ message: "Equipment not found" });
    res.status(200).json(equipment);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving equipment" });
  }
};

// Delete equipment
export const deleteEquipment = async (req, res) => {
  try {
    const deleted = await Equipment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Equipment not found" });
    res.status(200).json({ message: "Equipment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete equipment" });
  }
};


// Update equipment
export const updateImageKey = async (req, res) => {
  const {imageKey,
          bucketName
    } = req.body;
  const equipId = req.params.id;

  try {
    const updatedImageKey = await Equipment.findByIdAndUpdate(
      equipId,
      { imageKey,
        bucketName},
      { new: true }
    );

    if (!updatedImageKey) return res.status(404).json({ message: 'Equipment not found' });

    res.status(200).json({ updatedImageKey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating Equipment image key' });
  }
};