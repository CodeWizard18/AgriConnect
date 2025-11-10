import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, default: "kg" },
    stock: { type: Number, required: true },
    description: String,
    image: String, // we can store URL or base64
    pincode: String,
    city: String,       // ✅ add this
    state: String,
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farmerPhoneNumber: { type: String, required: true } // Added farmer phone number field
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
