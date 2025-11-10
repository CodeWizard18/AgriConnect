import React from 'react';
import { Leaf, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">AgriConnect</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Empowering farmers, building communities. A hyper-local marketplace connecting farmers directly with consumers for fresh, sustainable produce.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for sustainable agriculture</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-green-400 transition-colors duration-200">About Us</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors duration-200">How it Works</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors duration-200">For Farmers</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors duration-200">For Customers</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-green-400 transition-colors duration-200">Help Center</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors duration-200">Contact Us</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors duration-200">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 AgriConnect. Supporting UN SDG Goals for Sustainable Agriculture.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-gray-400">Follow us:</span>
              <div className="flex space-x-2">
                {/* Social media icons would go here */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}