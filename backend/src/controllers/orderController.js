import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * Create a new order
 */
export async function createOrder(req, res) {
  try {
    console.log("CreateOrder request body:", req.body);

    // Find the first product to identify the farmer
    const firstProduct = await Product.findById(req.body.items[0].product);
    if (!firstProduct) {
      return res.status(400).json({ message: "Product not found" });
    }

    const farmer = firstProduct.farmer;
    const farmerPhoneNumber = firstProduct.farmerPhoneNumber;

    // Create order and save customer phone number from frontend
    const order = await Order.create({
      ...req.body,
      customer: req.user.id,
      farmer,
      farmerPhoneNumber,
      phoneNumber: req.body.phoneNumber,
    });

    res.status(201).json(order);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ message: "Validation error", errors: messages });
    }
    res.status(500).json({ message: err.message });
  }
}

/**
 * Get all orders for a logged-in customer
 */
export async function getCustomerOrders(req, res) {
  try {
    // Include regular orders where customer matches, and phone orders where customer matches or customerName exists (for non-registered)
    const orders = await Order.find({
      $or: [
        { customer: req.user.id },
        { orderType: 'phone', customer: req.user.id },
        { orderType: 'phone', customerName: { $exists: true } } // Include all phone orders for now, frontend can filter
      ]
    })
      .populate("items.product")
      .populate("farmer", "name phoneNumber"); // get farmer info

    // Filter phone orders to only show those where customerName matches the logged-in user's name
    const filteredOrders = orders.filter(order => {
      if (order.orderType === 'phone') {
        return order.customerName === req.user.name;
      }
      return true;
    });

    res.json(filteredOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Get all orders for a logged-in farmer
 */
export async function getFarmerOrders(req, res) {
  try {
    const orders = await Order.find({ farmer: req.user.id })
      .populate("items.product")
      .populate("customer", "name"); // keep only customer name, phone is inside order

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Update order status (pending → packed → delivered)
 */
export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
