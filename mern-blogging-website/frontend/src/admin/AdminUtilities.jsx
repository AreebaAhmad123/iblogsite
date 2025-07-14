import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../App';
import axios from 'axios';
import InPageNavigation from '../components/inpage-navigation.component';
import Loader from '../components/loader.component';
// Add Recharts imports
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminUtilities = () => {
  const { userAuth } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [dbStats, setDbStats] = useState(null);
  const [loadingDb, setLoadingDb] = useState(false);
  // Add state for analytics history
  const [dbMaintenanceHistory, setDbMaintenanceHistory] = useState([]);
  const [dbMaintenanceLatest, setDbMaintenanceLatest] = useState(null);
  const [loadingDbHistory, setLoadingDbHistory] = useState(false);
  const [systemHealthHistory, setSystemHealthHistory] = useState([]);
  const [systemHealthLatest, setSystemHealthLatest] = useState(null);
  const [loadingHealthHistory, setLoadingHealthHistory] = useState(false);

  const handleCleanup = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/cleanup-unused-banners`,
        {},
        { headers: { 'Authorization': `Bearer ${userAuth.access_token}` } }
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to clean up images.');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemHealthCheck = async () => {
    setLoadingHealth(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/system-health`,
        { headers: { 'Authorization': `Bearer ${userAuth.access_token}` } }
      );
      setSystemHealth(res.data);
    } catch (err) {
      console.error('Failed to fetch system health:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  const handleDatabaseMaintenance = async () => {
    setLoadingDb(true);
    setDbStats(null);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/database-maintenance`,
        {},
        { headers: { 'Authorization': `Bearer ${userAuth.access_token}` } }
      );
      setDbStats(res.data);
    } catch (err) {
      setDbStats(null);
      setError('Failed to perform database maintenance.');
    } finally {
      setLoadingDb(false);
    }
  };

  // Fetch DB maintenance history
  const fetchDbMaintenanceHistory = async () => {
    setLoadingDbHistory(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/database-maintenance-history`,
        { headers: { 'Authorization': `Bearer ${userAuth.access_token}` } }
      );
      setDbMaintenanceHistory(res.data.history || []);
    } catch (err) {
      setDbMaintenanceHistory([]);
    } finally {
      setLoadingDbHistory(false);
    }
  };
  // Fetch latest DB maintenance
  const fetchDbMaintenanceLatest = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/database-maintenance-latest`,
        { headers: { 'Authorization': `Bearer ${userAuth.access_token}` } }
      );
      setDbMaintenanceLatest(res.data.latest || null);
    } catch (err) {
      setDbMaintenanceLatest(null);
    }
  };
  // Fetch system health history
  const fetchSystemHealthHistory = async () => {
    setLoadingHealthHistory(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/system-health-history`,
        { headers: { 'Authorization': `Bearer ${userAuth.access_token}` } }
      );
      setSystemHealthHistory(res.data.history || []);
    } catch (err) {
      setSystemHealthHistory([]);
    } finally {
      setLoadingHealthHistory(false);
    }
  };
  // Fetch latest system health
  const fetchSystemHealthLatest = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/system-health-latest`,
        { headers: { 'Authorization': `Bearer ${userAuth.access_token}` } }
      );
      setSystemHealthLatest(res.data.latest || null);
    } catch (err) {
      setSystemHealthLatest(null);
    }
  };

  // Fetch analytics history on mount
  useEffect(() => {
    fetchDbMaintenanceHistory();
    fetchDbMaintenanceLatest();
    fetchSystemHealthHistory();
    fetchSystemHealthLatest();
  }, [userAuth.access_token]);

  // Prepare chart data for database maintenance
  const prepareDbMaintenanceChartData = () => {
    return dbMaintenanceHistory.slice(0, 10).map(log => ({
      date: new Date(log.date).toLocaleDateString(),
      cleanedRecords: log.orphanedComments || 0,
      sizeReduction: log.sizeReduction || 0,
      optimizedIndexes: log.optimizedIndexes || 0
    }));
  };
  // Prepare chart data for system health
  const prepareSystemHealthChartData = () => {
    return systemHealthHistory.slice(0, 10).map(log => ({
      date: new Date(log.timestamp).toLocaleDateString(),
      memoryUsage: log.memoryUsage?.percentage || 0,
      uptime: log.uptime || 0,
      issues: log.issues?.length || 0,
      responseTime: log.responseTime || 0
    }));
  };
  // Prepare system health status data for pie chart
  const prepareSystemHealthStatusData = () => {
    const statusCounts = systemHealthHistory.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-medium mb-6">Admin Utilities</h1>
      
      <InPageNavigation routes={["Image Cleanup", "Database Maintenance", "System Health"]} defaultActiveIndex={0}>
        {/* Image Cleanup Tab */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-lg font-medium mb-4">Image Cleanup</h2>
            <p className="text-gray-600 mb-4">Remove unused banner images from the server to free up storage space.</p>
            <button
              className="btn-dark px-4 py-2 rounded mb-4"
              onClick={handleCleanup}
              disabled={loading}
            >
              {loading ? 'Cleaning up...' : 'Clean Up Unused Banner Images'}
            </button>
            {result && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-700">Successfully deleted {result.deletedCount} unused images.</p>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Database Maintenance Tab */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-lg font-medium mb-4">Database Maintenance</h2>
            <p className="text-gray-600 mb-4">Optimize indexes and clean up orphaned records in the database.</p>
            <button
              className="btn-dark px-4 py-2 rounded mb-4"
              onClick={handleDatabaseMaintenance}
              disabled={loadingDb}
            >
              {loadingDb ? 'Performing maintenance...' : 'Run Database Maintenance'}
            </button>
            {loadingDb && <Loader />}
            {dbStats && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-medium mb-2">Maintenance Results:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Optimized indexes: <span className="font-semibold">{dbStats.optimizedIndexes}</span></li>
                  <li>• Orphaned comments deleted: <span className="font-semibold">{dbStats.cleanedRecords?.orphanedComments}</span></li>
                  <li>• Blogs with missing authors deleted: <span className="font-semibold">{dbStats.cleanedRecords?.blogsWithMissingAuthors}</span></li>
                  <li>• Database size: <span className="font-semibold">{dbStats.sizeReduction || 'N/A'}</span></li>
                </ul>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            {/* Analytics Charts */}
            {dbMaintenanceHistory.length > 0 && (
              <div className="space-y-6 mt-8">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-700">📊 Rendering charts with {dbMaintenanceHistory.length} maintenance records</p>
                </div>
                {/* Cleaned Records Chart */}
                <div className="p-4 bg-white border border-gray-200 rounded">
                  <h4 className="font-medium mb-4">Cleaned Records Over Time</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareDbMaintenanceChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="cleanedRecords" fill="#8884d8" name="Cleaned Records" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Size Reduction Chart */}
                <div className="p-4 bg-white border border-gray-200 rounded">
                  <h4 className="font-medium mb-4">Database Size Reduction</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={prepareDbMaintenanceChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sizeReduction" stroke="#82ca9d" name="Size Reduction (MB)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* System Health Tab */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-lg font-medium mb-4">System Health</h2>
            <p className="text-gray-600 mb-4">Check the overall health and performance of the system.</p>
            <button
              className="btn-dark px-4 py-2 rounded mb-4"
              onClick={handleSystemHealthCheck}
              disabled={loadingHealth}
            >
              {loadingHealth ? 'Checking health...' : 'Check System Health'}
            </button>
            {loadingHealth && <Loader />}
            {systemHealth && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={`p-4 rounded border ${
                    systemHealth.serverStatus === 'Healthy' ? 'bg-green-50 border-green-200' :
                    systemHealth.serverStatus === 'Warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <h3 className={`font-medium mb-1 ${
                      systemHealth.serverStatus === 'Healthy' ? 'text-green-700' :
                      systemHealth.serverStatus === 'Warning' ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>Server Status</h3>
                    <p className={`text-sm ${
                      systemHealth.serverStatus === 'Healthy' ? 'text-green-600' :
                      systemHealth.serverStatus === 'Warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>{systemHealth.serverStatus}</p>
                  </div>
                  <div className={`p-4 rounded border ${
                    systemHealth.databaseStatus === 'Connected' ? 'bg-green-50 border-green-200' :
                    systemHealth.databaseStatus === 'Connecting' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <h3 className={`font-medium mb-1 ${
                      systemHealth.databaseStatus === 'Connected' ? 'text-green-700' :
                      systemHealth.databaseStatus === 'Connecting' ? 'text-yellow-700' :
                      'text-red-700'
                    }`}>Database Status</h3>
                    <p className={`text-sm ${
                      systemHealth.databaseStatus === 'Connected' ? 'text-green-600' :
                      systemHealth.databaseStatus === 'Connecting' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>{systemHealth.databaseStatus}</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <h3 className="font-medium text-blue-700 mb-1">Memory Usage</h3>
                    <p className="text-sm text-blue-600">{systemHealth.memoryUsage}</p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                    <h3 className="font-medium text-purple-700 mb-1">Uptime</h3>
                    <p className="text-sm text-purple-600">{systemHealth.uptime}</p>
                  </div>
                </div>
                {systemHealth.issues && systemHealth.issues.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <h3 className="font-medium text-yellow-700 mb-2">Issues Found:</h3>
                    <ul className="space-y-1 text-sm text-yellow-600">
                      {systemHealth.issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {systemHealth.issues && systemHealth.issues.length === 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded">
                    <h3 className="font-medium text-green-700 mb-2">All Systems Operational</h3>
                    <p className="text-sm text-green-600">No issues detected. All systems are running normally.</p>
                  </div>
                )}
              </div>
            )}
            {/* Analytics Charts */}
            {systemHealthHistory.length > 0 && (
              <div className="space-y-6 mt-8">
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-700">📊 Rendering charts with {systemHealthHistory.length} health records</p>
                </div>
                {/* Memory Usage Chart */}
                <div className="p-4 bg-white border border-gray-200 rounded">
                  <h4 className="font-medium mb-4">Memory Usage Over Time</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={prepareSystemHealthChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="memoryUsage" stroke="#8884d8" fill="#8884d8" name="Memory Usage (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* Issues Over Time Chart */}
                <div className="p-4 bg-white border border-gray-200 rounded">
                  <h4 className="font-medium mb-4">Issues Over Time</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareSystemHealthChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="issues" fill="#ff7300" name="Issues Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Health Status Distribution */}
                <div className="p-4 bg-white border border-gray-200 rounded">
                  <h4 className="font-medium mb-4">Health Status Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareSystemHealthStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {prepareSystemHealthStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </InPageNavigation>
    </div>
  );
};

export default AdminUtilities; 