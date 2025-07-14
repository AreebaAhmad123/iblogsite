// Test script for draft saving functionality
import mongoose from 'mongoose';
import Blog from './Schema/Blog.js';
import User from './Schema/User.js';

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/islamic-stories-blog';

async function testDraftSaving() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test 1: Create a draft with minimal data
    console.log('\n=== Test 1: Creating draft with minimal data ===');
    const testUser = await User.findOne();
    if (!testUser) {
      console.log('No test user found. Please create a user first.');
      return;
    }

    const draftData = {
      title: "Test Draft",
      des: "",
      banner: "",
      content: [{ time: Date.now(), blocks: [], version: '2.27.2' }],
      tags: [],
      draft: true,
      author: testUser._id
    };

    const draft = new Blog(draftData);
    await draft.save();
    console.log('✅ Draft created successfully with ID:', draft.blog_id);

    // Test 2: Update the draft
    console.log('\n=== Test 2: Updating draft ===');
    draft.title = "Updated Test Draft";
    draft.des = "This is a test description";
    draft.tags = ["test", "draft"];
    await draft.save();
    console.log('✅ Draft updated successfully');

    // Test 3: Validate draft structure
    console.log('\n=== Test 3: Validating draft structure ===');
    const savedDraft = await Blog.findOne({ blog_id: draft.blog_id });
    console.log('Draft structure:', {
      blog_id: savedDraft.blog_id,
      title: savedDraft.title,
      draft: savedDraft.draft,
      content_length: savedDraft.content.length,
      tags_length: savedDraft.tags.length
    });

    // Test 4: Test content validation
    console.log('\n=== Test 4: Testing content validation ===');
    const contentWithBlocks = {
      ...draftData,
      content: [{
        time: Date.now(),
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'This is a test paragraph'
            }
          }
        ],
        version: '2.27.2'
      }],
      title: "Draft with Content"
    };

    const draftWithContent = new Blog(contentWithBlocks);
    await draftWithContent.save();
    console.log('✅ Draft with content created successfully');

    // Test 5: Test draft query
    console.log('\n=== Test 5: Testing draft query ===');
    const allDrafts = await Blog.find({ author: testUser._id, draft: true });
    console.log(`Found ${allDrafts.length} drafts for user`);
    allDrafts.forEach((d, i) => {
      console.log(`Draft ${i + 1}:`, {
        blog_id: d.blog_id,
        title: d.title,
        draft: d.draft
      });
    });

    // Test 6: Test published vs draft separation
    console.log('\n=== Test 6: Testing published vs draft separation ===');
    const publishedBlog = new Blog({
      ...draftData,
      title: "Published Blog",
      des: "This is a published blog",
      banner: "https://example.com/banner.jpg",
      content: [{
        time: Date.now(),
        blocks: [{ type: 'paragraph', data: { text: 'Published content' } }],
        version: '2.27.2'
      }],
      tags: ["published", "test"],
      draft: false
    });
    await publishedBlog.save();
    console.log('✅ Published blog created successfully');

    const publishedCount = await Blog.countDocuments({ author: testUser._id, draft: false });
    const draftCount = await Blog.countDocuments({ author: testUser._id, draft: true });
    console.log(`Published blogs: ${publishedCount}, Drafts: ${draftCount}`);

    // Test 7: Test the exact API query
    console.log('\n=== Test 7: Testing API query ===');
    const apiDrafts = await Blog.find({ author: testUser._id, draft: true })
      .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
      .sort({ "publishedAt": -1 })
      .select("title des banner activity publishedAt blog_id tags draft -_id")
      .limit(5);
    
    console.log(`API query found ${apiDrafts.length} drafts`);
    apiDrafts.forEach((d, i) => {
      console.log(`API Draft ${i + 1}:`, {
        blog_id: d.blog_id,
        title: d.title,
        draft: d.draft,
        author: d.author?.personal_info?.username
      });
    });

    console.log('\n✅ All draft saving tests completed successfully!');

  } catch (error) {
    console.error('❌ Error in draft saving test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testDraftSaving(); 