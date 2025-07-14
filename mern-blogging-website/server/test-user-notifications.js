import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './Schema/User.js';
import Notification from './Schema/Notification.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const testUserNotifications = async () => {
    try {
        await connectDB();
        
        // Find the specific user
        const user = await User.findOne({ "personal_info.username": "bitf22m026" });
        if (!user) {
            console.log('User not found');
            return;
        }
        
        console.log('User found:', {
            id: user._id,
            username: user.personal_info.username,
            fullname: user.personal_info.fullname,
            admin: user.admin,
            super_admin: user.super_admin
        });
        
        // Check notifications for this user
        const notifications = await Notification.find({ notification_for: user._id })
            .populate('user', 'personal_info.fullname personal_info.username')
            .sort({ createdAt: -1 });
        
        console.log(`\nNotifications for user ${user.personal_info.username}: ${notifications.length}`);
        
        notifications.forEach((notification, index) => {
            console.log(`${index + 1}. Type: ${notification.type}`);
            console.log(`   From: ${notification.user?.personal_info?.fullname || 'Unknown'}`);
            console.log(`   Seen: ${notification.seen}`);
            console.log(`   Created: ${notification.createdAt}`);
            console.log('');
        });
        
        // Test the exact query that the API uses
        const isAdmin = user.admin || user.role === 'admin';
        console.log('User is admin:', isAdmin);
        
        let query = { notification_for: user._id };
        console.log('Base query:', query);
        
        // Test with 'all' filter
        const allNotifications = await Notification.find(query);
        console.log('All notifications count:', allNotifications.length);
        
        // Test with specific filters
        const newUserNotifications = await Notification.find({ ...query, type: 'new_user' });
        console.log('New user notifications count:', newUserNotifications.length);
        
        const commentNotifications = await Notification.find({ ...query, type: 'comment' });
        console.log('Comment notifications count:', commentNotifications.count);
        
        const likeNotifications = await Notification.find({ ...query, type: 'like' });
        console.log('Like notifications count:', likeNotifications.length);
        
        mongoose.connection.close();
        console.log('\nTest completed');
        
    } catch (error) {
        console.error('Test error:', error);
        mongoose.connection.close();
    }
};

testUserNotifications(); 