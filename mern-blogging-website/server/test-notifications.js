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

const testNotifications = async () => {
    try {
        await connectDB();
        
        // Get total notifications count
        const totalNotifications = await Notification.countDocuments();
        console.log(`Total notifications in database: ${totalNotifications}`);
        
        // Get notifications by type
        const notificationsByType = await Notification.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('\nNotifications by type:');
        notificationsByType.forEach(item => {
            console.log(`  ${item._id}: ${item.count}`);
        });
        
        // Get some sample notifications
        const sampleNotifications = await Notification.find()
            .populate('user', 'personal_info.fullname personal_info.username')
            .populate('notification_for', 'personal_info.fullname personal_info.username')
            .limit(5)
            .sort({ createdAt: -1 });
        
        console.log('\nSample notifications:');
        sampleNotifications.forEach((notification, index) => {
            console.log(`  ${index + 1}. Type: ${notification.type}`);
            console.log(`     For: ${notification.notification_for?.personal_info?.fullname || 'Unknown'}`);
            console.log(`     User: ${notification.user?.personal_info?.fullname || 'Unknown'}`);
            console.log(`     Seen: ${notification.seen}`);
            console.log(`     Created: ${notification.createdAt}`);
            console.log('');
        });
        
        // Check if there are any admin users
        const adminUsers = await User.find({ admin: true });
        console.log(`Admin users found: ${adminUsers.length}`);
        adminUsers.forEach(user => {
            console.log(`  - ${user.personal_info.fullname} (${user.personal_info.username})`);
        });
        
        // Check notifications for admin users
        if (adminUsers.length > 0) {
            const adminUserIds = adminUsers.map(user => user._id);
            const adminNotifications = await Notification.find({
                notification_for: { $in: adminUserIds }
            }).populate('user', 'personal_info.fullname personal_info.username');
            
            console.log(`\nNotifications for admin users: ${adminNotifications.length}`);
            adminNotifications.forEach((notification, index) => {
                console.log(`  ${index + 1}. Type: ${notification.type} - From: ${notification.user?.personal_info?.fullname || 'Unknown'}`);
            });
        }
        
        mongoose.connection.close();
        console.log('\nTest completed');
        
    } catch (error) {
        console.error('Test error:', error);
        mongoose.connection.close();
    }
};

testNotifications(); 