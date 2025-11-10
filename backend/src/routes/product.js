import express from "express";
import { createProduct, getProducts, getFarmerProducts, updateProduct, deleteProduct, upload } from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, upload.single('image'), createProduct);
router.get("/", getProducts);
router.get("/my", authMiddleware, getFarmerProducts);
router.put("/:id", authMiddleware, upload.single('image'), updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
