import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { ProductCard } from '../../components/ProductCard';
import { api } from '../../api/dummyApi';

export function Browse() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    pincode: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = async () => {
    const data = await api.getProducts();
    // Add farmerName field from nested farmer object and trim image URLs
    const productsWithFarmerName = data.map((product: any) => ({
      ...product,
      farmerName: product.farmer?.name || 'Unknown',
      image: product.image?.trim()
    }));
    setProducts(productsWithFarmerName);
    setFilteredProducts(productsWithFarmerName);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Refresh products when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchProducts();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      let filtered = products;

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter((product: any) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Category filter
      if (filters.category) {
        filtered = filtered.filter((product: any) => product.category === filters.category);
      }

      // Price range filter
      if (filters.minPrice) {
        filtered = filtered.filter((product: any) => product.price >= parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        filtered = filtered.filter((product: any) => product.price <= parseFloat(filters.maxPrice));
      }

      // Pincode filter
      if (filters.pincode) {
        filtered = filtered.filter((product: any) => product.pincode.includes(filters.pincode));
      }

      setFilteredProducts(filtered);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters, products]);

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Herbs'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Browse Fresh Products
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover fresh, local produce from farmers in your area
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, farmers, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="110001"
                    value={filters.pincode}
                    onChange={(e) => setFilters({ ...filters, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredProducts.length} products
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
