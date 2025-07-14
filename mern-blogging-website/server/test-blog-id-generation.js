// Test script for blog_id generation
import mongoose from 'mongoose';
import Blog from './Schema/Blog.js';
import User from './Schema/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogging_website';

async function testBlogIdGeneration() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a test user
    const testUser = await User.findOne();
    if (!testUser) {
      console.log('No test user found. Please create a user first.');
      return;
    }

    console.log('Testing blog_id generation...\n');

    // Test 1: Create blog with title
    console.log('=== Test 1: Blog with title ===');
    const blog1 = new Blog({
      title: "My Test Blog",
      des: "Test description",
      content: [{ time: Date.now(), blocks: [], version: '2.27.2' }],
      tags: ["test"],
      draft: true,
      author: testUser._id
    });

    await blog1.save();
    console.log('✅ Blog created with blog_id:', blog1.blog_id);
    console.log('Expected pattern: my-test-blog-XXXXXXXX');
    console.log('Actual blog_id:', blog1.blog_id);

    // Test 2: Create blog without title
    console.log('\n=== Test 2: Blog without title ===');
    const blog2 = new Blog({
      title: "",
      des: "",
      content: [{ time: Date.now(), blocks: [], version: '2.27.2' }],
      tags: [],
      draft: true,
      author: testUser._id
    });

    await blog2.save();
    console.log('✅ Blog created with blog_id:', blog2.blog_id);
    console.log('Expected pattern: blog-XXXXXXXX');
    console.log('Actual blog_id:', blog2.blog_id);

    // Test 3: Create blog with special characters in title
    console.log('\n=== Test 3: Blog with special characters ===');
    const blog3 = new Blog({
      title: "My Test Blog! @#$%^&*()",
      des: "",
      content: [{ time: Date.now(), blocks: [], version: '2.27.2' }],
      tags: [],
      draft: true,
      author: testUser._id
    });

    await blog3.save();
    console.log('✅ Blog created with blog_id:', blog3.blog_id);
    console.log('Expected pattern: my-test-blog-XXXXXXXX');
    console.log('Actual blog_id:', blog3.blog_id);

    // Test 4: Verify all blog_ids are unique
    console.log('\n=== Test 4: Verify uniqueness ===');
    const allBlogIds = [blog1.blog_id, blog2.blog_id, blog3.blog_id];
    const uniqueBlogIds = new Set(allBlogIds);
    
    if (allBlogIds.length === uniqueBlogIds.size) {
      console.log('✅ All blog_ids are unique');
    } else {
      console.log('❌ Duplicate blog_ids found');
    }

    // Test 5: Verify blog_id format
    console.log('\n=== Test 5: Verify blog_id format ===');
    const blogIdRegex = /^[a-z0-9-]+$/;
    const allValid = allBlogIds.every(id => {
      const isValid = blogIdRegex.test(id) && id.length >= 3 && id.length <= 100;
      console.log(`Blog ID "${id}": ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      return isValid;
    });

    if (allValid) {
      console.log('✅ All blog_ids have valid format');
    } else {
      console.log('❌ Some blog_ids have invalid format');
    }

    // Cleanup
    console.log('\n=== Cleanup ===');
    await Blog.deleteMany({ _id: { $in: [blog1._id, blog2._id, blog3._id] } });
    console.log('✅ Test blogs deleted');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testBlogIdGeneration(); 