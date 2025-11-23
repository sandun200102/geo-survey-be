
import { Project } from "../models/project.model.js";



export const UploadProject = async (req, res) => {
    const { projectName, projectId, location, longitude, latitude} = req.body;
    try {
        // Validate the request bodylongitude
        if (!projectName || !projectId ||  !location || !longitude || !latitude) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Check if the project already exists
        const projectAlreadyExists = await Project.findOne({ projectId });
        if (projectAlreadyExists) {
            return res.status(400).json({ message: 'Project already exists' });
        }

        // Upload a new Project
        const project = new Project({
            projectName, 
            projectId, 
            location, 
            longitude, 
            latitude
        });
        await project.save();        
    
        res.status(200).json({ 
                success: true,
                message: 'project upload successfully',
                project:{
                    ...project._doc,
                },
            });

    } catch (error) {
        console.error(error); // Add this line
        res.status(400).json({ message: 'Internal server error' });
    }
}

// Update permission
export const updateProject = async (req, res) => {

  const { projectName, 
            projectUrl, 
            location, 
            longitude, 
            latitude
    } = req.body;
  const projectId = req.params.id;

  try {
    const updatedproject = await Project.findByIdAndUpdate(
      projectId,
      { projectName, 
            projectUrl, 
            location, 
            longitude, 
            latitude
    },
      { new: true }
    );

    if (!updatedproject) return res.status(404).json({ message: 'Project not found' });

    res.status(200).json({ updatedproject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating Project' });
  }
};

// Get all permission
export const getAllProject = async (req, res) => {
  try {
    const project = await Project.find();
    res.status(200).json(project);
  } 
  catch (error) {
    res.status(500).json({ message: "Error fetching Project" });
  }
};

// export const removeProject = async (req, res) => {
//     try {
//         const { id } = req.params;

 
//         const deletedProject = await Project.findByIdAndDelete(id);

//         if (!deletedProject) {
//             return res.status(404).json({ success: false, message: "Project not found" });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Project removed successfully",
//             deletedProject: { ...deletedProject._doc},
//         });
//     } catch (error) {
//         console.error("Error in remove project: ", error);
//         res.status(500).json({ success: false, message: "Failed to remove project" });
//     }
// };

// Delete Project



export const removeProject = async (req, res) => {
  const projectId = req.params.id;

  try {
    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ 
      success: true,
      message: 'Project deleted successfully',
      deletedProject 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting project' });
  }
};
