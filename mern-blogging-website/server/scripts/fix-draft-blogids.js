// Script to fix missing blog_id for draft blogs
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

// Update this with your actual MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/YOUR_DB_NAME';

import Blog from '../Schema/Blog.js';

async function fixDraftBlogIds() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const drafts = await Blog.find({ draft: true, $or: [{ blog_id: { $exists: false } }, { blog_id: null }, { blog_id: '' }] });
  console.log(`Found ${drafts.length} draft blogs missing blog_id.`);

  for (const blog of drafts) {
    const base = blog.title ? blog.title.replace(/[a-zA-Z0-9]/g, ' ').replace(/[^a-z0-9]/g, '-').trim() : 'blog';
    blog.blog_id = base + nanoid();
    await blog.save();
    console.log(`Updated blog _id=${blog._id} with blog_id=${blog.blog_id}`);
  }

  await mongoose.disconnect();
  console.log('Done. Disconnected from MongoDB.');
}

fixDraftBlogIds().catch(err => {
  console.error('Error updating draft blogs:', err);
  process.exit(1);
}); 