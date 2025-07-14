// Test script for draft loading functionality
import mongoose from 'mongoose';
import Blog from './Schema/Blog.js';
import User from './Schema/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogging_website';

async function testDraftLoading() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test 1: Check if any users exist
    console.log('\n=== Test 1: Checking users ===');
    const users = await User.find().limit(5);
    console.log(`Found ${users.length} users`);
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    const testUser = users[0];
    console.log('Test user:', {
      id: testUser._id,
      username: testUser.personal_info?.username,
      email: testUser.personal_info?.email
    });

    // Test 2: Check all blogs for this user
    console.log('\n=== Test 2: Checking all blogs for user ===');
    const allBlogs = await Blog.find({ author: testUser._id });
    console.log(`Total blogs for user: ${allBlogs.length}`);
    
    allBlogs.forEach((blog, index) => {
      console.log(`Blog ${index + 1}:`, {
        blog_id: blog.blog_id,
        title: blog.title,
        draft: blog.draft,
        publishedAt: blog.publishedAt
      });
    });

    // Test 3: Check drafts specifically
    console.log('\n=== Test 3: Checking drafts ===');
    const drafts = await Blog.find({ author: testUser._id, draft: true });
    console.log(`Drafts found: ${drafts.length}`);
    
    drafts.forEach((draft, index) => {
      console.log(`Draft ${index + 1}:`, {
        blog_id: draft.blog_id,
        title: draft.title,
        draft: draft.draft,
        created_at: draft.created_at
      });
    });

    // Test 4: Check published blogs
    console.log('\n=== Test 4: Checking published blogs ===');
    const published = await Blog.find({ author: testUser._id, draft: false });
    console.log(`Published blogs found: ${published.length}`);
    
    published.forEach((blog, index) => {
      console.log(`Published ${index + 1}:`, {
        blog_id: blog.blog_id,
        title: blog.title,
        draft: blog.draft,
        publishedAt: blog.publishedAt
      });
    });

    // Test 5: Test the exact query used by the API
    console.log('\n=== Test 5: Testing API query ===');
    const apiQuery = { author: testUser._id, draft: true };
    const apiDrafts = await Blog.find(apiQuery)
      .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
      .sort({ "publishedAt": -1 })
      .select("title des banner activity publishedAt blog_id tags draft -_id")
      .limit(5);
    
    console.log(`API query found ${apiDrafts.length} drafts`);
    apiDrafts.forEach((draft, index) => {
      console.log(`API Draft ${index + 1}:`, {
        blog_id: draft.blog_id,
        title: draft.title,
        draft: draft.draft,
        author: draft.author?.personal_info?.username
      });
    });

    // Test 6: Check blog schema structure
    console.log('\n=== Test 6: Checking blog schema ===');
    if (drafts.length > 0) {
      const sampleDraft = drafts[0];
      console.log('Sample draft structure:', {
        _id: sampleDraft._id,
        blog_id: sampleDraft.blog_id,
        title: sampleDraft.title,
        des: sampleDraft.des,
        banner: sampleDraft.banner,
        content: Array.isArray(sampleDraft.content) ? sampleDraft.content.length : 'not array',
        tags: sampleDraft.tags,
        draft: sampleDraft.draft,
        author: sampleDraft.author,
        created_at: sampleDraft.created_at,
        publishedAt: sampleDraft.publishedAt
      });
    }

    console.log('\n✅ Draft loading test completed');

  } catch (error) {
    console.error('❌ Error in draft loading test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testDraftLoading(); 