import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Users, ShoppingBag, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { LanguageToggle } from '../components/LanguageToggle';

export function LandingPage() {
  const features = [
    {
      icon: Users,
      title: 'Direct Connection',
      description: 'Connect directly with local farmers in your area for the freshest produce'
    },
    {
      icon: ShoppingBag,
      title: 'Easy Shopping',
      description: 'Browse, compare, and order fresh products with just a few clicks'
    },
    {
      icon: TrendingUp,
      title: 'Fair Pricing',
      description: 'AI-powered price suggestions ensure fair deals for both farmers and customers'
    }
  ];

  const benefits = [
    'Fresh produce directly from farms',
    'Support local farmers and communities',
    'Transparent pricing and quality',
    //'Real-time chat with farmers',  // Removed chat mention
    'Weather alerts for farmers',
    'Hyper-local delivery network'
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LanguageToggle />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
                <Leaf className="h-16 w-16 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="text-green-600">Agri</span>Connect
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Empowering farmers, building communities. A hyper-local marketplace connecting farmers directly with consumers for fresh, sustainable produce.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Get Started
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </Link>
              
              <Link
                to="/login"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-lg text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 transition-all duration-200 shadow-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose AgriConnect?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We're revolutionizing the way farmers and customers connect, creating a sustainable ecosystem for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Supporting UN SDG Goals for Sustainable Agriculture
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                AgriConnect is committed to creating a sustainable future by empowering local farmers and building stronger communities through technology.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Leaf className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Join Our Community
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Be part of the sustainable agriculture revolution
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of farmers and customers already using AgriConnect to build a sustainable future.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Join as Customer
            </Link>
            
            <Link
              to="/signup"
              className="bg-transparent text-white px-8 py-4 rounded-lg text-lg font-semibold border-2 border-white hover:bg-white hover:text-green-600 transition-all duration-200 shadow-lg"
            >
              Join as Farmer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}