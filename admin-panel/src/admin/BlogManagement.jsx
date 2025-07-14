import { useEffect, useState, useContext } from 'react';
import { UserContext } from '../App';
import axios from 'axios';
import { ManagePublishedBlogCard, ManageDraftBlogPost } from '../components/manage-blogcard.component.jsx';
import Loader from '../components/loader.component.jsx';
import { Link } from 'react-router-dom';
import InPageNavigation from '../components/inpage-navigation.component.jsx';

const BlogManagement = () => {
  const { userAuth } = useContext(UserContext);
  const [publishedBlogs, setPublishedBlogs] = useState(null);
  const [draftBlogs, setDraftBlogs] = useState(null);
  const [loading, setLoading] = useState({ published: true, drafts: true });
  const [error, setError] = useState({ published: null, drafts: null });

  useEffect(() => {
    if (!userAuth || !userAuth.admin) return;
    fetchBlogs(false); // Published
    fetchBlogs(true);  // Drafts
    // eslint-disable-next-line
  }, [userAuth]);

  const fetchBlogs = async (draft) => {
    setLoading(prev => ({ ...prev, [draft ? 'drafts' : 'published']: true }));
    setError(prev => ({ ...prev, [draft ? 'drafts' : 'published']: null }));
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/all-blogs`,
        { draft },
        {
          headers: { 'Authorization': `Bearer ${userAuth.access_token}` },
        }
      );
      if (draft) setDraftBlogs(res.data.blogs || []);
      else setPublishedBlogs(res.data.blogs || []);
    } catch (err) {
      setError(prev => ({
        ...prev,
        [draft ? 'drafts' : 'published']: err.response?.data?.error || 'Failed to fetch blogs.'
      }));
    } finally {
      setLoading(prev => ({ ...prev, [draft ? 'drafts' : 'published']: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-medium">Blog Management</h1>
        <Link to="/admin/editor" className="btn-dark px-4 py-2 rounded">Create New Blog</Link>
      </div>
      
      <InPageNavigation routes={["Published Blogs", "Drafts"]} defaultActiveIndex={0}>
        {/* Published Blogs Tab */}
        <div>
          {loading.published ? (
            <Loader />
          ) : error.published ? (
            <div className="text-red-500 text-center">{error.published}</div>
          ) : publishedBlogs && publishedBlogs.length ? (
            <div className="space-y-6">
              {publishedBlogs.map((blog, idx) => (
                <ManagePublishedBlogCard key={blog.blog_id || idx} blog={{ ...blog, index: idx, setStateFunc: setPublishedBlogs }} />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center">No published blogs found.</div>
          )}
        </div>
        
        {/* Drafts Tab */}
        <div>
          {loading.drafts ? (
            <Loader />
          ) : error.drafts ? (
            <div className="text-red-500 text-center">{error.drafts}</div>
          ) : draftBlogs && draftBlogs.length ? (
            <div className="space-y-6">
              {draftBlogs.map((blog, idx) => (
                <ManageDraftBlogPost key={blog.blog_id || idx} blog={{ ...blog, index: idx, setStateFunc: setDraftBlogs }} />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center">No drafts found.</div>
          )}
        </div>
      </InPageNavigation>
    </div>
  );
};

export default BlogManagement; 