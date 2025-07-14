import mongoose from 'mongoose';
import 'dotenv/config';
import Notification from './Schema/Notification.js';
import User from './Schema/User.js';
import Blog from './Schema/Blog.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function createTestNotifications() {
    try {
        console.log('🧪 Creating Test Notifications...\n');

        // Get users
        const users = await User.find();
        const adminUser = users.find(u => u.admin);
        const regularUser = users.find(u => !u.admin);

        if (!adminUser || !regularUser) {
            console.log('❌ Need at least one admin and one regular user');
            return;
        }

        console.log(`👑 Admin: ${adminUser.personal_info?.fullname} (@${adminUser.personal_info?.username})`);
        console.log(`👤 Regular User: ${regularUser.personal_info?.fullname} (@${regularUser.personal_info?.username})`);

        // Get a blog
        const blog = await Blog.findOne({ draft: false });
        if (!blog) {
            console.log('❌ No published blogs found');
            return;
        }

        console.log(`📝 Blog: ${blog.title}`);

        // Create test notifications
        const testNotifications = [
            {
                type: 'like',
                user: regularUser._id,
                blog: blog._id,
                notification_for: adminUser._id,
                seen: false
            },
            {
                type: 'comment',
                user: regularUser._id,
                blog: blog._id,
                notification_for: adminUser._id,
                seen: false
            },
            {
                type: 'reply',
                user: regularUser._id,
                blog: blog._id,
                notification_for: adminUser._id,
                seen: false
            }
        ];

        // Clear existing test notifications
        await Notification.deleteMany({
            type: { $in: ['like', 'comment', 'reply'] },
            notification_for: adminUser._id
        });

        // Create new test notifications
        const createdNotifications = await Notification.insertMany(testNotifications);

        console.log(`✅ Created ${createdNotifications.length} test notifications:`);
        createdNotifications.forEach((notification, index) => {
            console.log(`   ${index + 1}. ${notification.type} notification (unread)`);
        });

        // Verify the notifications
        const unreadCount = await Notification.countDocuments({ 
            notification_for: adminUser._id, 
            seen: false 
        });
        console.log(`\n🔴 Total unread notifications for admin: ${unreadCount}`);

        console.log('\n🎉 Test notifications created successfully!');
        console.log('💡 Now test the frontend notifications page to see the red dots!');

    } catch (error) {
        console.error('❌ Error creating test notifications:', error);
    } finally {
        mongoose.disconnect();
    }
}

createTestNotifications(); 