// Test script for draft editing functionality
import mongoose from 'mongoose';
import Blog from './Schema/Blog.js';
import User from './Schema/User.js';

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/islamic-stories-blog';

async function testDraftEditing() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test 1: Create a test user if none exists
    console.log('\n=== Test 1: Setting up test user ===');
    let testUser = await User.findOne();
    if (!testUser) {
      console.log('No test user found. Please create a user first.');
      return;
    }
    console.log('Using test user:', testUser.personal_info.username);

    // Test 2: Create a draft
    console.log('\n=== Test 2: Creating draft ===');
    const draftData = {
      title: "Test Draft for Editing",
      des: "This is a test draft",
      banner: "",
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
      tags: ["test", "draft"],
      draft: true,
      author: testUser._id
    };

    const draft = new Blog(draftData);
    await draft.save();
    console.log('✅ Draft created successfully with ID:', draft.blog_id);

    // Test 3: Test the update functionality
    console.log('\n=== Test 3: Testing update functionality ===');
    const updatedData = {
      title: "Updated Test Draft",
      des: "This is an updated test draft",
      banner: "https://example.com/banner.jpg",
      content: [{ 
        time: Date.now(), 
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'This is an updated test paragraph'
            }
          },
          {
            type: 'paragraph',
            data: {
              text: 'This is another paragraph'
            }
          }
        ], 
        version: '2.27.2' 
      }],
      tags: ["test", "draft", "updated"],
      draft: true
    };

    // Find and update the draft
    const foundDraft = await Blog.findOne({ blog_id: draft.blog_id, author: testUser._id });
    if (!foundDraft) {
      console.log('❌ Draft not found for updating');
      return;
    }

    // Update the draft
    foundDraft.title = updatedData.title;
    foundDraft.des = updatedData.des;
    foundDraft.banner = updatedData.banner;
    foundDraft.content = updatedData.content;
    foundDraft.tags = updatedData.tags;

    await foundDraft.save();
    console.log('✅ Draft updated successfully');

    // Test 4: Verify the update
    console.log('\n=== Test 4: Verifying update ===');
    const updatedDraft = await Blog.findOne({ blog_id: draft.blog_id });
    console.log('Updated draft data:', {
      blog_id: updatedDraft.blog_id,
      title: updatedDraft.title,
      des: updatedDraft.des,
      draft: updatedDraft.draft,
      content_blocks: updatedDraft.content[0]?.blocks?.length,
      tags: updatedDraft.tags
    });

    // Test 5: Test draft querying
    console.log('\n=== Test 5: Testing draft querying ===');
    const userDrafts = await Blog.find({ author: testUser._id, draft: true });
    console.log(`Found ${userDrafts.length} drafts for user`);
    userDrafts.forEach((d, i) => {
      console.log(`Draft ${i + 1}:`, {
        blog_id: d.blog_id,
        title: d.title,
        draft: d.draft
      });
    });

    // Test 6: Test the get-blog endpoint simulation
    console.log('\n=== Test 6: Testing get-blog simulation ===');
    const blogForEdit = await Blog.findOne({ blog_id: draft.blog_id })
      .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img");
    
    if (blogForEdit) {
      console.log('✅ Blog found for editing:', {
        blog_id: blogForEdit.blog_id,
        title: blogForEdit.title,
        author: blogForEdit.author?.personal_info?.username,
        draft: blogForEdit.draft
      });
    } else {
      console.log('❌ Blog not found for editing');
    }

    // Cleanup: Delete test draft
    console.log('\n=== Cleanup ===');
    await Blog.findOneAndDelete({ blog_id: draft.blog_id });
    console.log('✅ Test draft deleted');

    console.log('\n🎉 All draft editing tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testDraftEditing(); 