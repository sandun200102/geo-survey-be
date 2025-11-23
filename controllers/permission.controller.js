
import { Permission } from "../models/permission.model.js";



export const createPermission = async (req, res) => {
    const { userId, userName, permissionId, userEmail, projectId,projectName, permissionStatus} = req.body;
    try {
        // Validate the request body
        if (!permissionStatus || !userEmail || !projectId || !permissionId || !userId || !userName || !projectName ) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Check if the equipment already exists
        const permissionAlreadyExists = await Permission.findOne({ permissionId });
        if (permissionAlreadyExists) {
            return res.status(400).json({ message: 'Booking already exists' });
        }

        // Create a new equipment
        const permission = new Permission({
            userId,
            userName,
            permissionId,
            userEmail,
            projectId,
            projectName,
            permissionStatus
        });
        await permission.save();        
    
        res.status(200).json({ 
                success: true,
                message: 'Permission creaded successfully',
                permission:{
                    ...Permission._doc,
                },
            });

    } catch (error) {
        console.error(error); // Add this line
        res.status(400).json({ message: 'Internal server error' });
    }
}

// Update permission
export const updatePermissionProj= async (req, res) => {
  const { permissionStatus
    } = req.body;
  const permissionId = req.params.id;

  try {
    const updatedePermission = await Permission.findByIdAndUpdate(
      permissionId,
      { permissionStatus,
      },
      { new: true }
    );

    if (!updatedePermission) return res.status(404).json({ message: 'Permission not found' });

    res.status(200).json({ updatedePermission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating permission status' });
  }
};

// Get all permission
export const getAllPermission = async (req, res) => {
  try {
    const permission = await Permission.find();
    res.status(200).json(permission);
  } catch (error) {
    res.status(500).json({ message: "Error fetching permission" });
  }
};

// Get permission status by MongoDB document ID
export const getPermissionStatus = async (req, res) => {
  const userId = req.params.id; // this is the userId from URL

  try {
    // Find by userId field, not by MongoDB _id
    const permission = await Permission.findOne({ userId });

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    res.status(200).json({
      permissionStatus: permission.permissionStatus,
      
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching permission status" });
  }
};


export const getPermissionProjectName= async (req, res) => {
  const userId = req.params.id; // this is the userId from URL

  try {
    // Find by userId field, not by MongoDB _id
    const permission = await Permission.findOne({ userId });

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    res.status(200).json({
      projectName: permission.projectName,
      
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching permission status" });
  }
};

export const getPermissionUserId= async (req, res) => {
  const userId = req.params.id; // this is the userId from URL

  try {
    // Find by userId field, not by MongoDB _id
    const permission = await Permission.findOne({ userId });

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    res.status(200).json({
      userId: permission.userId,
      
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching permission status" });
  }
};


