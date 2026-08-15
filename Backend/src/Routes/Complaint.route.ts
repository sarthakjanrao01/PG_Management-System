import express from "express";
import * as ComplaintController from "../Controllers/Complaint.controller";

const router = express.Router();

router.post("/create", ComplaintController.createComplaint);
router.post("/add", ComplaintController.createComplaint);
router.get("/user/:userId", ComplaintController.getComplaintsByUser);
router.get("/pg/:pgId", ComplaintController.getComplaintsByPg);
router.put("/review/:id", ComplaintController.markComplaintReviewedByUser);
router.put("/:id", ComplaintController.updateComplaintStatus);

router.delete("/clear-all", ComplaintController.deleteAllComplaints);
router.delete("/:id", ComplaintController.deleteComplaint);

export default router;
