import mongoose from 'mongoose';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import { connectDB } from './src/config/db.js';

async function seedData() {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Seed Users
    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@agriconnect.com',
        passwordHash: '$2b$10$examplehash', // Dummy hash
        role: 'admin',
        phone: '+919876543210',
        address: 'Admin Office, Delhi',
        status: 'active'
      },
      {
        name: 'Ramesh Kumar',
        email: 'ramesh@farmer.com',
        passwordHash: '$2b$10$examplehash',
        role: 'farmer',
        phone: '+919123456789',
        address: 'Village 1, Haryana',
        status: 'active'
      },
      {
        name: 'Sita Devi',
        email: 'sita@farmer.com',
        passwordHash: '$2b$10$examplehash',
        role: 'farmer',
        phone: '+918765432109',
        address: 'Village 2, Punjab',
        status: 'active'
      },
      {
        name: 'Amit Patel',
        email: 'amit@customer.com',
        passwordHash: '$2b$10$examplehash',
        role: 'customer',
        phone: '+917654321098',
        address: 'Urban Area, Delhi',
        status: 'active'
      },
      {
        name: 'Priya Sharma',
        email: 'priya@customer.com',
        passwordHash: '$2b$10$examplehash',
        role: 'customer',
        phone: '+916543210987',
        address: 'City Center, Mumbai',
        status: 'active'
      },
      {
        name: 'John Doe',
        email: 'john@customer.com',
        passwordHash: '$2b$10$examplehash',
        role: 'customer',
        phone: '+915432109876',
        address: 'Suburb, Bangalore',
        status: 'active'
      }
    ]);
    console.log(`Seeded ${users.length} users`);

    // Seed Products (link to farmers)
    const products = await Product.insertMany([
      {
        name: 'Fresh Tomatoes',
        description: 'Organic tomatoes from local farm',
        price: 25,
        unit: 'kg',
        category: 'Vegetables',
        image: 'https://example.com/tomato.jpg',
        farmer: users[1]._id, // Ramesh
        farmerPhoneNumber: '+919123456789',
        stock: 100,
        status: 'active'
      },
      {
        name: 'Wheat Grains',
        description: 'High quality wheat',
        price: 40,
        unit: 'kg',
        category: 'Grains',
        image: 'https://example.com/wheat.jpg',
        farmer: users[1]._id, // Ramesh
        farmerPhoneNumber: '+919123456789',
        stock: 500,
        status: 'active'
      },
      {
        name: 'Organic Rice',
        description: 'Basmati rice organic',
        price: 60,
        unit: 'kg',
        category: 'Grains',
        image: 'https://example.com/rice.jpg',
        farmer: users[2]._id, // Sita
        farmerPhoneNumber: '+918765432109',
        stock: 300,
        status: 'active'
      },
      {
        name: 'Fresh Apples',
        description: 'Red apples from hills',
        price: 80,
        unit: 'kg',
        category: 'Fruits',
        image: 'https://example.com/apple.jpg',
        farmer: users[2]._id, // Sita
        farmerPhoneNumber: '+918765432109',
        stock: 200,
        status: 'active'
      },
      {
        name: 'Potatoes',
        description: 'Fresh potatoes',
        price: 20,
        unit: 'kg',
        category: 'Vegetables',
        image: 'https://example.com/potato.jpg',
        farmer: users[1]._id, // Ramesh
        farmerPhoneNumber: '+919123456789',
        stock: 400,
        status: 'active'
      }
    ]);
    console.log(`Seeded ${products.length} products`);

    // Seed Orders (link to users and products)
    const orders = await Order.insertMany([
      {
        customer: users[3]._id, // Amit
        farmer: users[1]._id, // Ramesh
        items: [
          {
            product: products[0]._id, // Tomatoes
            quantity: 5,
            price: 25,
            unit: 'kg'
          },
          {
            product: products[4]._id, // Potatoes
            quantity: 10,
            price: 20,
            unit: 'kg'
          }
        ],
        totalAmount: 225,
        status: 'delivered',
        address: 'Amit\'s Address, Delhi',
        paymentMode: 'online'
      },
      {
        customer: users[4]._id, // Priya
        farmer: users[2]._id, // Sita
        items: [
          {
            product: products[2]._id, // Rice
            quantity: 2,
            price: 60,
            unit: 'kg'
          }
        ],
        totalAmount: 120,
        status: 'pending',
        address: 'Priya\'s Address, Mumbai',
        paymentMode: 'COD'
      },
      {
        customer: users[5]._id, // John
        farmer: users[1]._id, // Ramesh
        items: [
          {
            product: products[1]._id, // Wheat
            quantity: 25,
            price: 40,
            unit: 'kg'
          }
        ],
        totalAmount: 1000,
        status: 'shipped',
        address: 'John\'s Address, Bangalore',
        paymentMode: 'online'
      },
      {
        customer: null, // Phone order
        farmer: users[2]._id, // Sita
        phoneNumber: '+919999999999',
        items: [
          {
            product: products[3]._id, // Apples
            quantity: 3,
            price: 80,
            unit: 'kg'
          }
        ],
        totalAmount: 240,
        status: 'pending',
        address: 'Phone Order Address',
        paymentMode: 'COD',
        notes: 'Phone order from customer'
      }
    ]);
    console.log(`Seeded ${orders.length} orders`);

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
