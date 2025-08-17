import express from "express";
import {
  deleteContentCourse,
  deleteCourse,
  deleteStudentToCourse,
  getCategories,
  getCourseById,
  getCourses,
  getDetailContent,
  getStudentsByCourseId,
  postContentCourse,
  postCourse,
  postStudentToCourse,
  updateContentCourse,
  updateCourse,
} from "../controllers/courseController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import multer from "multer";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  addStudentCourseSchema,
  mutateContentSchema,
} from "../utils/schema.js";
import { fileFilter, fileStorageCourse } from "../utils/multer.js";

const courseRoutes = express.Router();

const upload = multer({
  storage: fileStorageCourse,
  fileFilter: fileFilter,
});

courseRoutes.get("/courses", verifyToken, getCourses);
courseRoutes.get("/categories", verifyToken, getCategories);
courseRoutes.get("/courses/:id", verifyToken, getCourseById);
courseRoutes.post(
  "/courses",
  verifyToken,
  upload.single("thumbnail"),
  postCourse
);
courseRoutes.put(
  "/courses/:id",
  verifyToken,
  upload.single("thumbnail"),
  updateCourse
);
courseRoutes.delete("/courses/:id", verifyToken, deleteCourse);

courseRoutes.post(
  "/courses/contents",
  verifyToken,
  validateRequest(mutateContentSchema),
  postContentCourse
);
courseRoutes.put(
  "/courses/contents/:id",
  verifyToken,
  validateRequest(mutateContentSchema),
  updateContentCourse
);
courseRoutes.delete("/courses/contents/:id", verifyToken, deleteContentCourse);
courseRoutes.get("/courses/contents/:id", verifyToken, getDetailContent);

courseRoutes.get("/courses/students/:id", verifyToken, getStudentsByCourseId);
courseRoutes.post(
  "/courses/students/:id",
  verifyToken,
  validateRequest(addStudentCourseSchema),
  postStudentToCourse
);
courseRoutes.put(
  "/courses/students/:id",
  verifyToken,
  validateRequest(addStudentCourseSchema),
  deleteStudentToCourse
);

export default courseRoutes;
