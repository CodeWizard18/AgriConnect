import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/dummyApi';
import { translations } from '../../i18n/translations';
import { Plus, Search, Package, TrendingUp, Users, Upload, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function FarmerListings() {
  const { user } = useAuth();
  const { language } = useTheme();
  const t = translations[language];
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    price: '',
    unit: 'kg',
    stock: '',
    description: '',
    pincode: '',
    city: '',
    state: '',
    farmerPhoneNumber: ''
  });
  const [showPriceSuggestion, setShowPriceSuggestion] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<any>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const allProducts = await api.getProducts();
      console.log("User ID:", user?.id);
      console.log("All Products:", allProducts);
      const farmerProducts = allProducts.filter((p: any) => p.farmer._id === user?.id);
      // Add farmerName field for each product for ProductCard display
      const productsWithFarmerName = farmerProducts.map((p: any) => ({
        ...p,
        farmerName: p.farmer.name || 'Unknown Farmer'
      }));
      setProducts(productsWithFarmerName);
    };
    if (user?.id) {
      fetchProducts();
    }
  }, [user?.id]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Herbs', 'Spices'];
  const units = ['kg', 'gram', 'liter', 'piece', 'dozen', 'bundle'];

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      stock: product.stock.toString(),
      description: product.description || '',
      pincode: product.pincode || '',
      city: product.city || '',
      state: product.state || '',
      farmerPhoneNumber: product.farmerPhoneNumber
    });
    setPreview(product.image ? (product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.image}`) : null);
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.category || !editFormData.price || !editFormData.stock || !editFormData.farmerPhoneNumber) {
      toast.error('Please fill all required fields including farmer phone number');
      return;
    }

    try {
      setIsUpdating(true);
      const updatedProduct = {
        name: editFormData.name,
        category: editFormData.category,
        price: parseFloat(editFormData.price),
        unit: editFormData.unit,
        stock: parseInt(editFormData.stock),
        farmer: user?.id,
        farmerPhoneNumber: editFormData.farmerPhoneNumber,
        image: selectedFile || null,
        description: editFormData.description,
        pincode: editFormData.pincode,
        city: editFormData.city,
        state: editFormData.state
      };

      const result = await api.updateProduct(editingProduct._id, updatedProduct);

      // Update the product in the local state
      setProducts(current =>
        current.map(p => p._id === editingProduct._id ? { ...result, farmerName: result.farmer.name || 'Unknown Farmer' } : p)
      );

      toast.success('Product updated successfully!');
      setIsEditModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error('Failed to update product. Please try again.');
      console.error('Update product error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper function to safely extract JSON
  function extractJSON(text: string) {
    try {
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (e) {
      console.error("JSON parse error:", e, text);
    }
    return null;
  }

  const getSuggestedPrice = async () => {
    if (!editFormData.name || !editFormData.category || !editFormData.stock) {
      toast.error("Please enter product name, category, and stock first");
      return;
    }

    let location = "";
    if (editFormData.pincode) {
      location = `Pincode ${editFormData.pincode}`;
    } else if (editFormData.city && editFormData.state) {
      location = `${editFormData.city}, ${editFormData.state}`;
    } else {
      toast.error("Please provide Pincode or City & State before getting AI suggestion");
      return;
    }

    setLoadingSuggestion(true);
    try {
      const apiKey = "AIzaSyB9WtNr8uf9jHAiSKlBHYwVylQJpCyDlEY";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const prompt = `
You are an agricultural market price assistant. Today is ${new Date().toLocaleDateString()}.

Analyze the following farmer product details and provide dynamic price suggestions based on current market conditions:

- Product Name: ${editFormData.name}
- Category: ${editFormData.category}
- Unit: ${editFormData.unit}
- Available Stock: ${editFormData.stock}
- Location: ${location}

Instructions:
1. Research or infer today's mandi/market prices for ${editFormData.name} in ${location} or nearby areas.
2. Consider factors like seasonality, demand, supply, quality, and local market trends.
3. Adjust prices based on the category (${editFormData.category}), unit (${editFormData.unit}), and stock availability (${editFormData.stock}).
4. Provide realistic min, average, and max prices per ${editFormData.unit} that vary based on the specific product and location.
5. Suggest one final recommended price that balances farmer profit and market competitiveness.

Return ONLY valid JSON with no extra text or explanations:
{
  "min": [number],
  "avg": [number],
  "max": [number],
  "final_suggestion": "[string explaining the recommendation based on market data]"
}
`;

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      });

      const data = await resp.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      console.log("AI Raw Response:", aiText);

      const parsed = extractJSON(aiText);

      if (parsed) {
        setPriceSuggestion(parsed);
        setShowPriceSuggestion(true);
      } else {
        toast.error("AI did not return valid JSON, using fallback");
        setPriceSuggestion({
          min: 35,
          avg: 42,
          max: 50,
          final_suggestion: "⚠️ Fallback: Recommended price is ₹42/unit",
        });
        setShowPriceSuggestion(true);
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      toast.error("Failed to fetch AI price suggestion");
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const applyPriceSuggestion = (price: number) => {
    setEditFormData({ ...editFormData, price: price.toString() });
    setShowPriceSuggestion(false);
    toast.success('Price suggestion applied!');
  };

  const handleDelete = async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      setProducts(current => current.filter(p => p._id !== productId));
      toast.success('Product deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete product. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t.my_product_listings}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t.manage_products_inventory}
            </p>
          </div>
          
          <Link
            to="/farmer/add-product"
            className="mt-4 md:mt-0 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>{t.add_new_product_btn}</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.search_products}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              showActions={true}
              onEdit={handleEdit}
              onDelete={() => handleDelete(product._id)}
            />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No matching products found' : t.no_products_listed}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {searchTerm
                  ? 'Try adjusting your search to find what you\'re looking for.'
                  : t.start_adding_products
                }
              </p>
              {!searchTerm && (
                <Link
                  to="/farmer/add-product"
                  className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors duration-200 font-medium inline-flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>{t.add_first_product}</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {products.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.active_products}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.total_stock_value}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{products.reduce((sum, p) => sum + (p.price * p.stock), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.categories}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(products.map(p => p.category)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.edit_product}</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                {/* Product Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Image
                  </label>
                  <label
                    htmlFor="edit-file-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-500 dark:hover:border-green-400 transition-colors duration-200"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">{t.click_select_new_image}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">(PNG, JPG up to 5MB)</p>
                      </>
                    )}
                    <input
                      id="edit-file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPreview(URL.createObjectURL(file));
                          setSelectedFile(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Product Name & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      required
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit *
                    </label>
                    <select
                      required
                      value={editFormData.unit}
                      onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      {units.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={editFormData.stock}
                      onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Farmer Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Farmer Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editFormData.farmerPhoneNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, farmerPhoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your phone number (with country code, e.g., +919876543210)"
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={editFormData.pincode}
                      onChange={(e) => setEditFormData({ ...editFormData, pincode: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="110001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={editFormData.city}
                      onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={editFormData.state}
                      onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* AI Price Suggestion Button */}
                <div>
                  <button
                    type="button"
                    onClick={getSuggestedPrice}
                    disabled={loadingSuggestion}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{loadingSuggestion ? t.getting_suggestion : t.get_ai_price_suggestion}</span>
                  </button>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isUpdating ? t.updating : t.update_product}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Price Suggestion Modal */}
        {showPriceSuggestion && priceSuggestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.ai_price_suggestion}</h3>
              </div>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm">Min</p>
                    <p className="text-lg font-bold text-red-600">{priceSuggestion.min}</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm">Avg</p>
                    <p className="text-lg font-bold text-green-600">{priceSuggestion.avg}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm">Max</p>
                    <p className="text-lg font-bold text-blue-600">{priceSuggestion.max}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm">{priceSuggestion.final_suggestion}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => applyPriceSuggestion(priceSuggestion.avg || 0)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  {t.use_suggested_price}
                </button>
                <button
                  onClick={() => setShowPriceSuggestion(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
