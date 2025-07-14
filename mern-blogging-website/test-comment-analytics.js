const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/analytics';

async function testCommentTrends() {
  try {
    const res = await axios.get(`${BASE_URL}/comments/trends`);
    console.log('Comment Trends:', res.data);
  } catch (err) {
    console.error('Error fetching comment trends:', err.response ? err.response.data : err.message);
  }
}

async function testTopBlogs() {
  try {
    const res = await axios.get(`${BASE_URL}/blogs/top`);
    console.log('Top Blogs:', res.data);
  } catch (err) {
    console.error('Error fetching top blogs:', err.response ? err.response.data : err.message);
  }
}

async function testCommentDistribution() {
  try {
    const res = await axios.get(`${BASE_URL}/comments/distribution`);
    console.log('Comment Distribution:', res.data);
  } catch (err) {
    console.error('Error fetching comment distribution:', err.response ? err.response.data : err.message);
  }
}

async function runAllTests() {
  await testCommentTrends();
  await testTopBlogs();
  await testCommentDistribution();
}

runAllTests(); 