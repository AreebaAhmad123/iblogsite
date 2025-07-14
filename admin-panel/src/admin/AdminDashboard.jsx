import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../App';
import axios from 'axios';
import Loader from '../components/loader.component';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboard() {
  const { userAuth } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState({ total: 0, active: 0, deactivated: 0, newUsers: 0 });
  const [blogStats, setBlogStats] = useState({ total: 0, published: 0, drafts: 0, recent: [] });
  const [commentStats, setCommentStats] = useState({ total: 0, blogsWithComments: 0, avgPerBlog: 0, recent: [] });
  const [newsletterStats, setNewsletterStats] = useState({ subscribers: 0, sent: 0 });
  const [systemHealth, setSystemHealth] = useState(null);
  const [systemHealthHistory, setSystemHealthHistory] = useState([]);

  // Fetch all analytics in parallel
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    const headers = { 'Authorization': `Bearer ${userAuth.access_token}` };
    Promise.all([
      // User stats
      axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/user-stats`, { headers }).catch(() => ({ data: {} })),
      // Blog stats
      axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/all-blogs`, {}, { headers }).catch(() => ({ data: { blogs: [] } })),
      // Comment analytics
      axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/comment-analytics`, { headers }).catch(() => ({ data: {} })),
      // Newsletter stats
      axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/newsletter-subscribers`, { headers }).catch(() => ({ data: { stats: {} } })),
      // System health
      axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/system-health`, { headers }).catch(() => ({ data: null })),
      // System health history
      axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/system-health-history`, { headers }).catch(() => ({ data: { history: [] } })),
    ]).then(([
      userRes, blogRes, commentRes, newsletterRes, sysHealthRes, sysHealthHistRes
    ]) => {
      if (!isMounted) return;
      // User stats
      const users = userRes.data.users || [];
      setUserStats({
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        deactivated: users.filter(u => u.status === 'deactivated').length,
        newUsers: users.filter(u => {
          const created = new Date(u.createdAt);
          const now = new Date();
          return (now - created) < 7 * 24 * 60 * 60 * 1000;
        }).length
      });
      // Blog stats
      const blogs = blogRes.data.blogs || [];
      setBlogStats({
        total: blogs.length,
        published: blogs.filter(b => b.draft !== true).length,
        drafts: blogs.filter(b => b.draft === true).length,
        recent: blogs.slice(0, 5)
      });
      // Comment stats
      setCommentStats({
        total: commentRes.data.totalComments || 0,
        blogsWithComments: commentRes.data.blogsWithComments || 0,
        avgPerBlog: commentRes.data.avgCommentsPerBlog || 0,
        recent: commentRes.data.recentActivity || []
      });
      // Newsletter stats
      setNewsletterStats({
        subscribers: (newsletterRes.data.stats && newsletterRes.data.stats.totalSubscribers) || 0,
        sent: (newsletterRes.data.stats && newsletterRes.data.stats.totalSent) || 0
      });
      // System health
      setSystemHealth(sysHealthRes.data || null);
      setSystemHealthHistory(sysHealthHistRes.data.history || []);
      setLoading(false);
    }).catch((err) => {
      if (!isMounted) return;
      setError('Failed to load dashboard analytics.');
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, [userAuth.access_token]);

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  // Prepare chart data
  const userPieData = [
    { name: 'Active', value: userStats.active },
    { name: 'Deactivated', value: userStats.deactivated },
  ];
  const blogPieData = [
    { name: 'Published', value: blogStats.published },
    { name: 'Drafts', value: blogStats.drafts },
  ];
  const commentAreaData = commentStats.recent.map(item => ({
    date: item.date ? new Date(item.date).toLocaleDateString() : '',
    comments: item.count || 0
  }));
  const sysHealthAreaData = systemHealthHistory.slice(0, 10).map(log => ({
    date: new Date(log.timestamp).toLocaleDateString(),
    value: log.memoryUsage || log.value || 0
  }));

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border flex flex-col items-center">
          <h2 className="text-lg font-medium mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-blue-600">{userStats.total}</p>
          <PieChart width={120} height={120} className="mx-auto">
            <Pie data={userPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} fill="#8884d8">
              {userPieData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border flex flex-col items-center">
          <h2 className="text-lg font-medium mb-2">Total Blogs</h2>
          <p className="text-3xl font-bold text-green-600">{blogStats.total}</p>
          <PieChart width={120} height={120} className="mx-auto">
            <Pie data={blogPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} fill="#82ca9d">
              {blogPieData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border flex flex-col items-center">
          <h2 className="text-lg font-medium mb-2">Total Comments</h2>
          <p className="text-3xl font-bold text-purple-600">{commentStats.total}</p>
          <span className="text-sm text-gray-500">Avg/Blog: {commentStats.avgPerBlog.toFixed(1)}</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border flex flex-col items-center">
          <h2 className="text-lg font-medium mb-2">Newsletter Subs</h2>
          <p className="text-3xl font-bold text-pink-600">{newsletterStats.subscribers}</p>
          <span className="text-sm text-gray-500">Sent: {newsletterStats.sent}</span>
        </div>
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-medium mb-4">Recent Comments Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={commentAreaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="comments" stroke="#8884d8" fill="#b39ddb" name="Comments" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-medium mb-4">System Memory Usage (Last 10)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={sysHealthAreaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#42a5f5" fill="#90caf9" name="Memory Usage" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow border mt-8">
        <h3 className="font-medium mb-4">Recent Blogs</h3>
        <ul className="divide-y divide-gray-200">
          {blogStats.recent.map((blog, idx) => (
            <li key={blog.blog_id || idx} className="py-2">
              <span className="font-semibold">{blog.title}</span>
              <span className="ml-2 text-gray-500 text-sm">{blog.author?.personal_info?.fullname || 'Unknown Author'}</span>
              <span className="ml-2 text-gray-400 text-xs">{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : ''}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 