import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/dummyApi';
import { translations } from '../../i18n/translations';

type PriceSuggestion = {
  min: number | null;
  avg: number | null;
  max: number | null;
  final_suggestion: string;
};

export function AddProduct() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useTheme();
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    unit: 'kg',
    stock: '',
    description: '',
    pincode: '',
    city: '',
    state: '',
    farmerPhoneNumber: '' // Added farmer phone number field
  });
  const [showPriceSuggestion, setShowPriceSuggestion] = useState(false);
  const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Herbs', 'Spices'];
  const units = ['kg', 'gram', 'liter', 'piece', 'dozen', 'bundle'];

  // ✅ Submit product
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price || !formData.stock || !formData.farmerPhoneNumber) {
      toast.error('Please fill all required fields including farmer phone number');
      return;
    }
    const newProduct = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      unit: formData.unit,
      stock: parseInt(formData.stock),
      farmer: user?.id,
      farmerPhoneNumber: formData.farmerPhoneNumber, // Added farmer phone number
      image: selectedFile || null,
      description: formData.description,
      pincode: formData.pincode,
      city: formData.city,     // ✅ include
      state: formData.state 
    };
    try {
      setIsSubmitting(true);
      await api.addProduct(newProduct);
      toast.success('Product added successfully!');
      navigate('/farmer/listings');
    } catch (error) {
      toast.error('Failed to add product. Please try again.');
      console.error('Add product error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

 //  Helper function to safely extract JSON
function extractJSON(text: string) {
  try {
    // Remove markdown code fences if Gemini adds them
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    const match = text.match(/\{[\s\S]*\}/); // find first {...}
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch (e) {
    console.error("JSON parse error:", e, text);
  }
  return null;
}

// Gemini AI price suggestion
const getSuggestedPrice = async () => {
  if (!formData.name || !formData.category || !formData.stock) {
    toast.error("Please enter product name, category, and stock first");
    return;
  }

  let location = "";
  if (formData.pincode) {
    location = `Pincode ${formData.pincode}`;
  } else if (formData.city && formData.state) {
    location = `${formData.city}, ${formData.state}`;
  } else {
    toast.error("Please provide Pincode or City & State before getting AI suggestion");
    return;
  }

  setLoadingSuggestion(true);
  try {
    const apiKey = "AIzaSyB9WtNr8uf9jHAiSKlBHYwVylQJpCyDlEY"; // 🔑 Hardcoded for now
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `
You are an agricultural market price assistant. Today is ${new Date().toLocaleDateString()}.

Analyze the following farmer product details and provide dynamic price suggestions based on current market conditions:

- Product Name: ${formData.name}
- Category: ${formData.category}
- Unit: ${formData.unit}
- Available Stock: ${formData.stock}
- Location: ${location}

Instructions:
1. Research or infer today's mandi/market prices for ${formData.name} in ${location} or nearby areas.
2. Consider factors like seasonality, demand, supply, quality, and local market trends.
3. Adjust prices based on the category (${formData.category}), unit (${formData.unit}), and stock availability (${formData.stock}).
4. Provide realistic min, average, and max prices per ${formData.unit} that vary based on the specific product and location.
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

  // ✅ Apply suggestion
  const applyPriceSuggestion = (price: number) => {
    setFormData({ ...formData, price: price.toString() });
    setShowPriceSuggestion(false);
    toast.success('Price suggestion applied!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/farmer/listings')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            {t.back_to_listings}
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t.add_new_product}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.list_fresh_produce}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
             {/* Product Image */}
<div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.product_image}
                  </label>

  <label
    htmlFor="file-upload"
    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed
               border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer
               hover:border-green-500 dark:hover:border-green-400 transition-colors duration-200"
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
                        <p className="text-gray-600 dark:text-gray-400">
          {t.click_select_image}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t.png_jpg_up_to_5mb}
        </p>
      </>
    )}
    <input
      id="file-upload"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          setPreview(URL.createObjectURL(file));
          setSelectedFile(file);
          console.log("Selected file:", file);
        }
      }}
    />
  </label>
</div>


              {/* Product Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.product_name} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.select_category} *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">{t.select_category}</option>
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
                    {t.price_required}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.unit_required}
                  </label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.stock_quantity} *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Farmer Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.farmer_phone_number} *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.farmerPhoneNumber}
                  onChange={(e) => setFormData({ ...formData, farmerPhoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder={t.enter_phone_with_code}
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.pincode}
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="110001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.city}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.state}
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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
                  {t.description}
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700"
                >
                  {t.add_product}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/farmer/listings')}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>

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
