import React, { useState, useEffect } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, X, Eye, Package } from 'lucide-react';
import { api } from '../../api/dummyApi';
import toast from 'react-hot-toast';

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
          <img
            src={`http://localhost:5000${product.image}`}
            alt={product.name}
            className="w-full h-64 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjggMTI4SDE2MFYxNjBIMTI4VjEyOFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEyOCAxNjBIMTYwVjEyOEgxMjhWMTYwWiIgZmlsbD0iIzlDQTQ5QSIvPgo8L3N2Zz4=';
            }}
          />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">By {product.farmer?.name || 'Unknown Farmer'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{product.price}/{product.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{product.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stock</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{product.stock} {product.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reports</p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">{product.reportCount || 0}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                <p className="text-gray-900 dark:text-white mt-1">{product.description || 'No description available'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-gray-900 dark:text-white mt-1">
                  {product.city && product.state ? `${product.city}, ${product.state}` : 'Location not specified'}
                  {product.pincode && ` - ${product.pincode}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Moderation() {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([] as any[]);
  const [products, setProducts] = useState([] as any[]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, productsData] = await Promise.all([
          api.getUsersForModeration(),
          api.getProductsForModeration()
        ]);
        setUsers(usersData);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch moderation data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleUserStatus = async (userId: string) => {
    try {
      const currentUser = users.find(u => u._id === userId);
      if (!currentUser) return;
      
      const newStatus = currentUser.status === 'active' ? 'blocked' : 'active';
      await api.updateUserStatus(userId, newStatus);
      
      setUsers(current =>
        current.map(user =>
          user._id === userId
            ? { ...user, status: newStatus }
            : user
        )
      );
      toast.success('User status updated successfully!');
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const removeProduct = async (productId: string) => {
    try {
      await api.deleteProductAdmin(productId);
      setProducts(current => current.filter(p => p._id !== productId));
      toast.success('Product removed successfully!');
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.farmer && product.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Content Moderation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and moderate users and products on the platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <X className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blocked Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter(u => u.status === 'blocked').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.reduce((sum, p) => sum + (p.reportCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'users'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'products'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Products ({products.length})
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'users' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Join Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'farmer' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => toggleUserStatus(user._id)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
                              user.status === 'active'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                            }`}
                          >
                            {user.status === 'active' ? 'Block' : 'Unblock'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <img
                          src={`http://localhost:5000${product.image}`}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEgyNFYyNEgyMFYyMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTIwIDI0SDI0VjIwSDIwVjI0WiIgZmlsbD0iIzlDQTQ5QSIvPgo8L3N2Zz4=';
                          }}
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">By {product.farmer?.name || 'Unknown'}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">₹{product.price}/{product.unit}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{product.category}</span>
                            {product.reportCount > 0 && (
                              <span className="flex items-center text-sm text-red-600 dark:text-red-400">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                {product.reportCount} reports
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
                          title="View Product Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeProduct(product._id)}
                          className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium rounded-md transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}
