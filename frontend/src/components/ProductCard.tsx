import React from 'react';
import { MapPin, Star, ShoppingCart, Package, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  farmer: {
    name: string;
    email: string;
  };
  farmerPhoneNumber: string;
  image?: string;
  description: string;
  pincode: string;
}

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function ProductCard({ product, showActions = false, onEdit, onDelete }: ProductCardProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <img
          src={
            product.image
              ? product.image.startsWith('http')
                ? product.image.trim()
                : product.image.startsWith('/uploads/')
                  ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.image.trim()}`
                  : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${product.image.trim()}`
              : 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Farmer: {product.farmer.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
          <Phone className="h-4 w-4 mr-1" />
          {product.farmerPhoneNumber}
        </p>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{product.price}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">/{product.unit}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Package className="h-4 w-4 mr-1" />
            <span>{product.stock} {product.unit} left</span>
          </div>
        </div>

        {showActions && user?.role === 'farmer' ? (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit?.(product)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(product._id)}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        ) : user?.role === 'customer' ? (
          <div className="space-y-2">
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </button>
            <a
              href={`https://wa.me/${product.farmerPhoneNumber}?text=Hi ${product.farmer.name}, I am interested in your ${product.name} (${product.category}). Can you provide more details about availability and pricing?`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>Contact Farmer</span>
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}