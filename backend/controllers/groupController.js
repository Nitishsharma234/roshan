import TravelGroup from "../models/group.js";

// Create Group
export const createGroup = async (req, res) => {
  try {
    const group = new TravelGroup(req.body);
    await group.save();
    res.status(201).json({
      message: "Group created successfully",
      data: group,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update Group
export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await TravelGroup.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json({
      message: "Group updated successfully",
      data: group,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Group
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await TravelGroup.findByIdAndDelete(id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get Single Group
export const getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await TravelGroup.findById(id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Groups
export const getAllGroups = async (req, res) => {
  try {
    const groups = await TravelGroup.find();
    res.json(groups);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
