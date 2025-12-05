const express = require("express");
const{createGroup,updateGroup,deleteGroup,getGroup,getAllGroups}=require("../controllers/groupController.js");

const GroupRouter = express.Router();

GroupRouter.post("/create", createGroup);
GroupRouter.patch("/update/:id", updateGroup);
GroupRouter.delete("/delete/:id", deleteGroup);
GroupRouter.get("/all", getAllGroups);
GroupRouter.get("/:id", getGroup);


module.exports = GroupRouter;