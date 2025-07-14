const axios = require('axios');

// Test the bookmarked blogs pagination endpoint
async function testBookmarkedPagination() {
    try {
        // Test with some sample blog IDs (you'll need to replace these with actual blog IDs from your database)
        const testBlogIds = ['blog1', 'blog2', 'blog3', 'blog4', 'blog5', 'blog6', 'blog7', 'blog8', 'blog9', 'blog10'];
        
        console.log('Testing bookmarked blogs pagination...');
        
        // Test first page
        const response1 = await axios.post('http://localhost:3000/get-blogs-by-ids', {
            blog_ids: testBlogIds,
            page: 1,
            limit: 5
        });
        
        console.log('Page 1 response:', {
            blogsCount: response1.data.blogs.length,
            totalDocs: response1.data.totalDocs,
            expectedTotalDocs: testBlogIds.length
        });
        
        // Test second page
        const response2 = await axios.post('http://localhost:3000/get-blogs-by-ids', {
            blog_ids: testBlogIds,
            page: 2,
            limit: 5
        });
        
        console.log('Page 2 response:', {
            blogsCount: response2.data.blogs.length,
            totalDocs: response2.data.totalDocs,
            expectedTotalDocs: testBlogIds.length
        });
        
        // Test with empty array
        const response3 = await axios.post('http://localhost:3000/get-blogs-by-ids', {
            blog_ids: [],
            page: 1,
            limit: 5
        });
        
        console.log('Empty array response:', {
            blogsCount: response3.data.blogs.length,
            totalDocs: response3.data.totalDocs
        });
        
    } catch (error) {
        console.error('Error testing bookmarked pagination:', error.response?.data || error.message);
    }
}

testBookmarkedPagination(); 