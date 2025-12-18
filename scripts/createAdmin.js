require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AdminModel = require('../models/AdminModel');
const connectDb = require('../config/db');

async function createAdmin() {
    try {
        // Connect to database
        await connectDb();

        const email = 'waqasasghar@gmail.com';
        const password = 'Progenius123@';
        const fullName = 'Admin User';
        const phoneNumber = '+1234567890'; // You can change this

        // Check if admin already exists
        const existingAdmin = await AdminModel.findOne({ email });
        if (existingAdmin) {
            console.log('❌ Admin user with this email already exists!');
            console.log('Admin ID:', existingAdmin._id);
            console.log('Email:', existingAdmin.email);
            process.exit(0);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const newAdmin = new AdminModel({
            email,
            password: hashedPassword,
            fullName,
            phoneNumber,
        });

        await newAdmin.save();

        console.log('✅ Admin user created successfully!');
        console.log('Admin ID:', newAdmin._id);
        console.log('Email:', newAdmin.email);
        console.log('Full Name:', newAdmin.fullName);
        console.log('\nYou can now login with:');
        console.log('Email: waqasasghar@gmail.com');
        console.log('Password: Progenius123@');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    }
}

createAdmin();
