import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderType: { type: String, enum: ['regular', 'phone'], default: 'regular' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: function() { return this.orderType === 'regular'; } },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: function() { return this.orderType === 'regular'; } },

    farmerPhoneNumber: { type: String, required: function() { return this.orderType === 'regular'; } }, // from product/farmer

    phoneNumber: { type: String, required: function() { return this.orderType === 'regular'; } }, // ✅ keep it consistent

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: function() { return this.orderType === 'regular'; } },
        quantity: { type: Number, required: function() { return this.orderType === 'regular'; } },
        price: { type: Number, required: function() { return this.orderType === 'regular'; } },
        unit: String,
      },
    ],

    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "packed", "delivered"],
      default: "pending",
    },
    address: { type: String, required: function() { return this.orderType === 'regular'; } },
    paymentMode: { type: String, enum: ["COD", "UPI", "CARD"], default: "COD" },

    // Phone order specific fields
    orderImage: { type: String },
    customerName: { type: String, required: function() { return this.orderType === 'phone'; } },
    customerPhone: { type: String, required: function() { return this.orderType === 'phone'; } },
    customerAddress: { type: String, required: function() { return this.orderType === 'phone'; } },
    customerCity: String,
    customerState: String,
    customerPincode: String,
    farmerPhone: { type: String, required: function() { return this.orderType === 'phone'; } },
    farmerAddress: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
