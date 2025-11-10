export const dummyFarmers = [
  { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '9876543210', location: 'Delhi' },
  { id: 2, name: 'Amit Singh', email: 'amit@example.com', phone: '9876543211', location: 'Mumbai' },
  { id: 3, name: 'Suresh Patel', email: 'suresh@example.com', phone: '9876543212', location: 'Gujarat' }
];

export const dummyProducts = [
  { id: 1, name: 'Organic Tomatoes', category: 'Vegetables', price: 40, unit: 'kg', stock: 100, farmer: 'Rajesh Kumar' },
  { id: 2, name: 'Fresh Wheat', category: 'Grains', price: 25, unit: 'kg', stock: 500, farmer: 'Amit Singh' },
  { id: 3, name: 'Premium Rice', category: 'Grains', price: 60, unit: 'kg', stock: 200, farmer: 'Suresh Patel' },
  { id: 4, name: 'Organic Potatoes', category: 'Vegetables', price: 30, unit: 'kg', stock: 150, farmer: 'Rajesh Kumar' },
  { id: 5, name: 'Fresh Milk', category: 'Dairy', price: 50, unit: 'liter', stock: 50, farmer: 'Amit Singh' }
];

export const dummyOrders = [
  { id: 1, customer: 'John Doe', farmer: 'Rajesh Kumar', product: 'Organic Tomatoes', quantity: 5, total: 200, status: 'delivered' },
  { id: 2, customer: 'Jane Smith', farmer: 'Amit Singh', product: 'Fresh Wheat', quantity: 10, total: 250, status: 'pending' },
  { id: 3, customer: 'Bob Johnson', farmer: 'Suresh Patel', product: 'Premium Rice', quantity: 3, total: 180, status: 'delivered' },
  { id: 4, customer: 'Alice Brown', farmer: 'Rajesh Kumar', product: 'Organic Potatoes', quantity: 8, total: 240, status: 'delivered' },
  { id: 5, customer: 'Charlie Wilson', farmer: 'Amit Singh', product: 'Fresh Milk', quantity: 2, total: 100, status: 'pending' }
];

const API_BASE_URL = 'http://localhost:5000';

export const api = {
  // Auth
  login: async (email: string, password: string, role: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  },
  
  

  // Products
  getProducts: async (filters?: any) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/api/products?${query}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  },

  //   // Farmers
  // getFarmers: async () => {
  //   const token = localStorage.getItem('agriconnect_token');
  //   const response = await fetch(`${API_BASE_URL}/api/auth/farmers`, {
  //     headers: {
  //       ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  //     }
  //   });
  //   if (!response.ok) throw new Error('Failed to fetch farmers');
  //   return await response.json();
  // }


  addProduct: async (product: any) => {
    const token = localStorage.getItem('agriconnect_token');
    const formData = new FormData();
    for (const key in product) {
      if (key === 'image' && product[key] instanceof File) {
        formData.append(key, product[key]);
      } else {
        formData.append(key, product[key]);
      }
    }
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to add product');
    return await response.json();
  },

  updateProduct: async (productId: string, product: any) => {
    const token = localStorage.getItem('agriconnect_token');
    const formData = new FormData();
    for (const key in product) {
      if (key === 'image' && product[key] instanceof File) {
        formData.append(key, product[key]);
      } else {
        formData.append(key, product[key]);
      }
    }
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to update product');
    return await response.json();
  },

 // Weather (OpenWeatherMap)
getWeather: async (location: { city?: string; state?: string; pincode?: string }) => {
  try {
    let query = "";

    if (location.city && location.city.trim() !== "") {
      // ✅ Use City + State (better accuracy than pincode in India)
      query = `q=${location.city}${location.state ? "," + location.state : ""},in`;
    } 
    else if (location.pincode && location.pincode.trim() !== "") {
      // ⚠️ fallback if city missing
      query = `zip=${location.pincode},in`;
    } 
    else {
      throw new Error("No valid location provided");
    }

    const apiKey = "f39d770685496cafba801c904958d7ad"; 
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) throw new Error("Failed to fetch weather");
    const data = await response.json();

    return {
      location: `${data.name}, ${data.sys.country}`, // e.g. Ghaziabad, IN
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      condition: data.weather[0].description,
      windSpeed: Math.round(data.wind.speed),
      alert: data.weather[0].main.toLowerCase().includes("rain")
        ? "🌧 Rain expected. Cover your crops!"
        : undefined,
    };
  } catch (error) {
    console.warn("⚠️ Falling back to dummy weather", error);
    return {
      location: "Gurgaon, Haryana",
      temperature: 24,
      humidity: 68,
      condition: "Partly Cloudy",
      windSpeed: 12,
      alert: "⚠️ Light rain expected in the evening. Cover your crops!",
    };
  }
},


 // AI Price Suggestion (Gemini Flash 2.5)
getSuggestedPrice: async (
  productName: string,
  category: string,
  quantity: number,
  location: string
) => {
  try {
    const apiKey = "AIzaSyB9WtNr8uf9jHAiSKlBHYwVylQJpCyDlEY"; // 🔑 put your Gemini Flash 2.5 key here
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // 🧠 Prompt for Gemini
    const prompt = `
You are an agricultural market price assistant. 
Today is ${new Date().toLocaleDateString()}.

The farmer wants to sell:
- Product: ${productName}
- Quantity: ${quantity} ${category}
- Location: ${location} (use mandi/market data for this area)

Tasks:
1. Search for the **current day mandi/market prices** of ${productName} in ${location}.
2. Suggest a **minimum, average, and maximum** possible price per ${category}.
3. Recommend **one final selling price** that balances farmer profit and fair buyer cost.

⚠️ Very important:
- Always base your answer on the **latest available data for today**.
- If no exact data exists, infer from nearby mandi/market prices for the same commodity.
- Return answer **strictly in JSON format** like this:

{
  "min": 30,
  "avg": 38,
  "max": 45,
  "final_suggestion": "Based on today's mandi prices in ${location}, the recommended price is ₹38/${category}"
}
    `;

    // Call Gemini API
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });

    const data = await resp.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Parse Gemini's JSON output
    const parsed = JSON.parse(aiText);

    return parsed;
  } catch (err) {
    console.error("Gemini price suggestion error:", err);
    return {
      min: 35,
      avg: 42,
      max: 50,
      final_suggestion: "⚠️ Fallback: Recommended price is ₹42 per unit",
    };
  }
},


  // Orders
  getOrders: async (role: string) => {
    const token = localStorage.getItem('agriconnect_token');
    const endpoint = role === 'farmer' ? `${API_BASE_URL}/api/orders/farmer` : `${API_BASE_URL}/api/orders/customer`;
    const response = await fetch(endpoint, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  },

  createOrder: async (order: any) => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return await response.json();
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update order status');
    return await response.json();
  },

  deleteProduct: async (productId: string) => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return await response.json();
  },

  // Messages
  sendMessage: async (recipientId: string, message: string) => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ recipientId, message }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  },

  getMessages: async (recipientId: string) => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/messages/${recipientId}`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  },

  getChatList: async () => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to fetch chat list');
    return await response.json();
  },

  markMessagesAsRead: async (senderId: string) => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/messages/read/${senderId}`, {
      method: 'PUT',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to mark messages as read');
    return await response.json();
  },

  // Admin APIs
  getAdminStats: async () => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to fetch admin stats');
    return await response.json();
  },

  getAnalyticsData: async () => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to fetch analytics data');
    return await response.json();
  },

  getUsersForModeration: async () => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  },

  getProductsForModeration: async () => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  },

  updateUserStatus: async (userId: string, status: string) => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update user status');
    return await response.json();
  },

  deleteProductAdmin: async (productId: string) => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return await response.json();
  },

  createPhoneOrder: async (orderData: any) => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/admin/phone-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create phone order' }));
      throw new Error(errorData.message || 'Failed to create phone order');
    }
    return await response.json();
  },

  getPhoneOrdersStats: async () => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/admin/phone-orders/stats`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to fetch phone orders stats');
    return await response.json();
  },

  getRecentActivity: async () => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/admin/recent-activity`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to fetch recent activity');
    return await response.json();
  },

  getWeeklyOrders: async () => {
    const token = localStorage.getItem('agriconnect_token');
    const response = await fetch(`${API_BASE_URL}/api/admin/weekly-orders`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Failed to fetch weekly orders');
    return await response.json();
  }
};

