import multer from 'multer';
import path from 'path';
import Product from "../models/Product.js";

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage: storage });

export async function createProduct(req, res) {
  try {
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const productData = { ...req.body, farmer: req.user.id, image: imageUrl };
    console.log('productData:', productData);

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: err.message });
  }
}

export async function getProducts(req, res) {
  try {
    const products = await Product.find().populate("farmer", "name email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getFarmerProducts(req, res) {
  try {
    const products = await Product.find({ farmer: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    console.log('req.user:', req.user);
    console.log('req.params.id:', req.params.id);
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    // Check if product exists and belongs to the user
    const existingProduct = await Product.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found or you don't have permission to update it" });
    }

    let imageUrl = existingProduct.image; // Keep existing image by default
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const updateData = { ...req.body, image: imageUrl };
    console.log('updateData:', updateData);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("farmer", "name email");

    res.json(updatedProduct);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: err.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    await Product.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
