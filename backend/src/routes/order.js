import express from "express";
import { createOrder, getCustomerOrders, getFarmerOrders, updateOrderStatus } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/customer", authMiddleware, getCustomerOrders);
router.get("/farmer", authMiddleware, getFarmerOrders);
router.put("/:id/status", authMiddleware, updateOrderStatus);

export default router;
