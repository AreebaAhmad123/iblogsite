import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../App';
import axios from 'axios';
import Loader from '../components/loader.component';

const NewsletterManagement = () => {
  const { userAuth } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({});
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  
  // Newsletter sending state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  
  // Test newsletter state
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Fetch subscribers
  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/newsletter-subscribers`,
        { headers: { 'Authorization': `Bearer ${userAuth.access_token}` } }
      );
      setSubscribers(res.data.subscribers);
      setStats(res.data.stats);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    if (userAuth.access_token) {
      fetchSubscribers();
    }
  }, [userAuth.access_token]);

  // Send newsletter to all subscribers
  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      alert('Please fill in both subject and content.');
      return;
    }

    setSendingNewsletter(true);
    setSendResult(null);
    
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/send-newsletter`,
        { subject, content },
        { headers: { 'Authorization': `Bearer ${userAuth.access_token}` } }
      );
      
      setSendResult({
        success: true,
        message: res.data.message,
        stats: res.data.stats
      });
      
      // Clear form
      setSubject('');
      setContent('');
      
      // Refresh subscribers
      fetchSubscribers();
    } catch (err) {
      setSendResult({
        success: false,
        message: err.response?.data?.error || 'Failed to send newsletter.'
      });
    } finally {
      setSendingNewsletter(false);
    }
  };

  // Send test newsletter
  const handleSendTestNewsletter = async (e) => {
    e.preventDefault();
    if (!testEmail.trim() || !subject.trim() || !content.trim()) {
      alert('Please fill in all fields for test newsletter.');
      return;
    }

    setSendingTest(true);
    setTestResult(null);
    
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/send-test-newsletter`,
        { email: testEmail, subject, content },
        { headers: { 'Authorization': `Bearer ${userAuth.access_token}` } }
      );
      
      setTestResult({
        success: true,
        message: res.data.message
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.error || 'Failed to send test newsletter.'
      });
    } finally {
      setSendingTest(false);
    }
  };

  // Update subscriber status
  const handleToggleSubscriberStatus = async (subscriberId, currentStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/newsletter-subscriber/${subscriberId}`,
        { isActive: !currentStatus },
        { headers: { 'Authorization': `Bearer ${userAuth.access_token}` } }
      );
      
      // Refresh subscribers
      fetchSubscribers();
    } catch (err) {
      console.error('Error updating subscriber status:', err);
      alert('Failed to update subscriber status.');
    }
  };

  // Delete subscriber
  const handleDeleteSubscriber = async (subscriberId) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/newsletter-subscriber/${subscriberId}`,
        { headers: { 'Authorization': `Bearer ${userAuth.access_token}` } }
      );
      
      // Refresh subscribers
      fetchSubscribers();
    } catch (err) {
      console.error('Error deleting subscriber:', err);
      alert('Failed to delete subscriber.');
    }
  };

  return (
    <div className="w-full max-w-full md:max-w-6xl mx-auto p-2 xs:p-3 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8 text-gray-800">Newsletter Management</h1>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700">Total Subscribers</h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.total || 0}</p>
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700">Active Subscribers</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.active || 0}</p>
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700">Inactive Subscribers</h3>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.inactive || 0}</p>
        </div>
      </div>
      {/* Send Newsletter Form */}
      <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-8">
        <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-6 text-gray-800">Send Newsletter</h2>
        <form onSubmit={handleSendNewsletter} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black dark:bg-black dark:text-white dark:border-gray-700"
              placeholder="Enter newsletter subject..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content (HTML supported)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black dark:bg-black dark:text-white dark:border-gray-700"
              rows="8"
              placeholder="Enter newsletter content (HTML supported)..."
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={sendingNewsletter}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {sendingNewsletter ? 'Sending...' : 'Send to All Subscribers'}
            </button>
          </div>
        </form>

        {sendResult && (
          <div className={`mt-4 p-4 rounded-md ${sendResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {sendResult.message}
            {sendResult.stats && (
              <div className="mt-2 text-sm">
                <p>Total subscribers: {sendResult.stats.totalSubscribers}</p>
                <p>Successfully sent: {sendResult.stats.successCount}</p>
                <p>Failed: {sendResult.stats.failureCount}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test Newsletter Form */}
      <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-8">
        <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-6 text-gray-800">Send Test Newsletter</h2>
        
        <form onSubmit={handleSendTestNewsletter} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Email
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black dark:bg-black dark:text-white dark:border-gray-700"
              placeholder="Enter test email address..."
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={sendingTest}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {sendingTest ? 'Sending...' : 'Send Test Newsletter'}
          </button>
        </form>

        {testResult && (
          <div className={`mt-4 p-4 rounded-md ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {testResult.message}
          </div>
        )}
      </div>

      {/* Subscribers List */}
      <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-6 text-gray-800">Subscribers</h2>
        
        {loadingSubscribers ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscriber.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscriber.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleToggleSubscriberStatus(subscriber._id, subscriber.isActive)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        {subscriber.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteSubscriber(subscriber._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterManagement; 