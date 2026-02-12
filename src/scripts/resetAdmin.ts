import dotenv from 'dotenv';
import mongoose from 'mongoose';
import AdminUser from '../models/AdminUser';

dotenv.config();

const resetAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/valygo-admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Delete existing admin
    const deleteResult = await AdminUser.deleteOne({ email: 'emailvalygolimited@gmail.com' });
    console.log(`Deleted ${deleteResult.deletedCount} existing admin user(s)`);

    // Create new admin user
    const adminUser = new AdminUser({
      name: 'VALYGO Admin',
      email: 'emailvalygolimited@gmail.com',
      password: 'cXmnZK65rf*&DaaD8wee',
      role: 'super_admin',
      status: 'active',
      permissions: ['all'],
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('Email: emailvalygolimited@gmail.com');
    console.log('Password: cXmnZK65rf*&DaaD8wee');
    console.log('Role: super_admin');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error resetting admin:', error);
    process.exit(1);
  }
};

resetAdmin();
