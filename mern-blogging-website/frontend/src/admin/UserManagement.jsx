import { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";
import axiosInstance from '../common/axios-config';
import AdminUserTable from "./UserManagement/AdminUserTable";
import AdminUserSearchBar from "./UserManagement/AdminUserSearchBar";
import Pagination from "../components/Pagination.jsx";
import InPageNavigation from "../components/inpage-navigation.component";

const badgeClass = (active, color) =>
  `inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full shadow-sm ${active ? color : 'bg-gray-200 text-gray-500'}`;

const crownIcon = (
  <svg className="inline w-4 h-4 text-yellow-500 mr-1 -mt-1" fill="currentColor" viewBox="0 0 20 20"><path d="M2.166 6.5l2.97 7.11a1 1 0 00.92.64h7.888a1 1 0 00.92-.64l2.97-7.11a.5.5 0 00-.82-.54l-3.13 2.61a1 1 0 01-1.32 0l-2.13-1.78-2.13 1.78a1 1 0 01-1.32 0l-3.13-2.61a.5.5 0 00-.82.54z" /></svg>
);
const adminIcon = (
  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
);
const userIcon = (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0 0V8m0 4h4m-4 0H8" /></svg>
);

const UserManagement = () => {
  const { userAuth } = useContext(UserContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [requestActionLoading, setRequestActionLoading] = useState("");
  const [myRequests, setMyRequests] = useState([]);
  const [pendingRequestsPage, setPendingRequestsPage] = useState(1);
  const pendingRequestsPerPage = 5;
  const pendingRequestsTotal = pendingRequests.length;
  const pendingRequestsTotalPages = Math.ceil(pendingRequestsTotal / pendingRequestsPerPage);
  const pendingRequestsStart = (pendingRequestsPage - 1) * pendingRequestsPerPage;
  const pendingRequestsEnd = Math.min(pendingRequestsPage * pendingRequestsPerPage, pendingRequestsTotal);
  const paginatedPendingRequests = pendingRequests.slice(pendingRequestsStart, pendingRequestsEnd);

  const admin = userAuth && userAuth.admin;
  const superAdmin = userAuth && userAuth.super_admin;

  useEffect(() => {
    // Prevent redirect if on /verify-user page
    if (window.location.pathname.startsWith('/verify-user')) return;
    if (!userAuth || !admin) {
      setTimeout(() => {
        navigate("/login?next=/admin", { replace: true });
      }, 2000);
      return;
    }
    fetchUsers(page, limit);
    // eslint-disable-next-line
  }, [userAuth, admin, page, limit]);

  useEffect(() => {
    if (!search.trim()) {
      fetchUsers();
      return;
    }
    setSearching(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await axiosInstance.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/search-users`,
          { query: search.trim() },
          { headers: { Authorization: `Bearer ${userAuth.access_token}` } }
        );
        setUsers(res.data.users || []);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to search users. Please try again."
        );
      } finally {
        setSearching(false);
      }
    }, 400);
    // Cleanup
    return () => clearTimeout(searchTimeout.current);
    // eslint-disable-next-line
  }, [search]);

  // Fetch pending requests for super admin
  useEffect(() => {
    if (superAdmin) {
      fetchPendingRequests();
    }
    if (userAuth && !superAdmin) {
      fetchMyRequests();
    }
    // eslint-disable-next-line
  }, [superAdmin, userAuth]);

  const fetchUsers = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/users?page=${page}&limit=${limit}`
      );
      setUsers(res.data.users || []);
      setTotalUsers(res.data.totalUsers || 0);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to fetch users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    setRequestsLoading(true);
    setRequestsError("");
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/status-change-requests`,
        { headers: { Authorization: `Bearer ${userAuth.access_token}` } }
      );
      setPendingRequests(res.data.requests || []);
    } catch (err) {
      setRequestsError(err.response?.data?.error || "Failed to fetch requests.");
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleApproveRequest = async (id) => {
    setRequestActionLoading(id + "-approve");
    try {
      await axiosInstance.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/status-change-requests/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${userAuth.access_token}` } }
      );
      fetchPendingRequests();
      setInfoMsg("Request approved.");
    } catch (err) {
      setInfoMsg(err.response?.data?.error || "Failed to approve request.");
    } finally {
      setRequestActionLoading("");
    }
  };

  const handleRejectRequest = async (id) => {
    setRequestActionLoading(id + "-reject");
    try {
      await axiosInstance.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/status-change-requests/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${userAuth.access_token}` } }
      );
      fetchPendingRequests();
      setInfoMsg("Request rejected.");
    } catch (err) {
      setInfoMsg(err.response?.data?.error || "Failed to reject request.");
    } finally {
      setRequestActionLoading("");
    }
  };

  // Fetch my own requests for non-super-admins
  const fetchMyRequests = async () => {
    setRequestsLoading(true);
    setRequestsError("");
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/my-status-change-requests`,
        { headers: { Authorization: `Bearer ${userAuth.access_token}` } }
      );
      setMyRequests(res.data.requests || []);
    } catch (err) {
      setRequestsError(err.response?.data?.error || "Failed to fetch your requests.");
    } finally {
      setRequestsLoading(false);
    }
  };

  const handlePromoteDemote = async (userId, makeAdmin) => {
    setActionLoading(userId + (makeAdmin ? "-promote" : "-demote"));
    setInfoMsg("");
    try {
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/set-admin`,
        { userId, admin: makeAdmin }
      );
      if (res.data.success) {
        fetchUsers();
      } else {
        setInfoMsg(res.data.message || "Request sent to super admin for approval.");
      }
    } catch (err) {
      alert(
        err.response?.data?.error || "Failed to update admin status. Please try again."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleSelectUser = (userId, checked) => {
    setSelectedUserIds(prev => checked ? [...prev, userId] : prev.filter(id => id !== userId));
  };
  const handleSelectAll = (checked) => {
    if (checked) setSelectedUserIds(users.map(u => u._id));
    else setSelectedUserIds([]);
  };
  const handleBulkAction = async (action) => {
    if (!superAdmin || selectedUserIds.length === 0) return;
    setActionLoading('bulk');
    try {
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/bulk-user-action`,
        { userIds: selectedUserIds, action },
        { headers: { Authorization: `Bearer ${userAuth.access_token}` } }
      );
      setInfoMsg(`Bulk action complete. Success: ${res.data.success.length}, Failed: ${res.data.failed.length}`);
      setSelectedUserIds([]);
      fetchUsers(page, limit);
    } catch (err) {
      setInfoMsg(err.response?.data?.error || 'Bulk action failed.');
    } finally {
      setActionLoading("");
    }
  };

  const handleDeleteRequest = async (id) => {
    setRequestActionLoading(id + "-delete");
    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/admin/delete-status-change-request/${id}`,
        { headers: { Authorization: `Bearer ${userAuth.access_token}` } }
      );
      fetchMyRequests();
      setInfoMsg("Request deleted.");
    } catch (err) {
      setInfoMsg(err.response?.data?.error || "Failed to delete request.");
    } finally {
      setRequestActionLoading("");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading users...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        {error}
        <button className="ml-4 underline" onClick={fetchUsers}>
          Retry
        </button>
      </div>
    );

  console.log('userAuth:', userAuth);
  console.log('superAdmin:', superAdmin);
  console.log('selectedUserIds:', selectedUserIds);

  // Define tab routes based on admin type
  const getTabRoutes = () => {
    if (superAdmin) {
      return ["Pending Requests", "User Management"];
    } else {
      return ["Request Status", "User Management"];
    }
  };

  const canDeleteSelected = users
    .filter(u => selectedUserIds.includes(u._id))
    .some(u => !u.super_admin && u._id !== userAuth._id);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <AdminUserSearchBar value={search} onChange={setSearch} searching={searching} />
      </div>

      <InPageNavigation routes={getTabRoutes()} defaultActiveIndex={0}>
        {/* First Tab Content */}
        {superAdmin ? (
          // Super Admin: Pending Requests Tab
          <div>
            {requestsLoading ? (
              <div>Loading requests...</div>
            ) : requestsError ? (
              <div className="text-red-500">{requestsError}</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-gray-500">No pending requests.</div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-2xl shadow-lg bg-white">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="p-4 font-medium rounded-tl-2xl">Requesting User</th>
                        <th className="p-4 font-medium">Target User</th>
                        <th className="p-4 font-medium">Action</th>
                        <th className="p-4 font-medium">Requested At</th>
                        <th className="p-4 font-medium text-center rounded-tr-2xl">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPendingRequests.map(req => (
                        <tr key={req._id} className="transition hover:bg-gray-50">
                          <td className="p-4 align-middle font-medium">
                            {req.requestingUser?.personal_info?.fullname || req.requestingUser?.fullname || req.requestingUser?.personal_info?.email || req.requestingUser?.email || '-'}
                          </td>
                          <td className="p-4 align-middle font-medium">
                            {req.targetUser?.personal_info?.fullname || req.targetUser?.fullname || req.targetUser?.personal_info?.email || req.targetUser?.email || '-'}
                          </td>
                          <td className="p-4 align-middle capitalize">{req.action}</td>
                          <td className="p-4 align-middle">{new Date(req.createdAt).toLocaleString()}</td>
                          <td className="p-4 align-middle text-center flex gap-2">
                            <button className="px-4 py-2 bg-green-50 text-green-700 border border-green-300 rounded-full shadow hover:bg-green-100 focus:ring-2 focus:ring-green-300 transition disabled:opacity-50" disabled={requestActionLoading === req._id + "-approve"} onClick={() => handleApproveRequest(req._id)}>{requestActionLoading === req._id + "-approve" ? "Approving..." : "Approve"}</button>
                            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full shadow hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 transition disabled:opacity-50" disabled={requestActionLoading === req._id + "-reject"} onClick={() => handleRejectRequest(req._id)}>{requestActionLoading === req._id + "-reject" ? "Rejecting..." : "Reject"}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={pendingRequestsPage}
                  limit={pendingRequestsPerPage}
                  total={pendingRequestsTotal}
                  onPageChange={setPendingRequestsPage}
                />
              </>
            )}
          </div>
        ) : (
          // Normal Admin: Request Status Tab
          <div>
            {requestsLoading ? (
              <div>Loading your requests...</div>
            ) : requestsError ? (
              <div className="text-red-500">{requestsError}</div>
            ) : myRequests.length === 0 ? (
              <div className="text-gray-500">You have not submitted any requests.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow-lg bg-white">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-3 font-medium text-left rounded-tl-2xl">Target User</th>
                      <th className="p-3 font-medium text-left">Action</th>
                      <th className="p-3 font-medium text-left">Status</th>
                      <th className="p-3 font-medium text-left">Requested At</th>
                      <th className="p-3 font-medium text-left">Reviewed By</th>
                      <th className="p-3 font-medium text-left">Reviewed At</th>
                      <th className="p-3 font-medium text-left rounded-tr-2xl">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.map((req, idx) => (
                      <tr key={req._id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="p-3 font-medium">
                          {req.targetUser?.personal_info?.fullname || req.targetUser?.fullname || req.targetUser?.personal_info?.email || req.targetUser?.email || '-'}
                        </td>
                        <td className="p-3 capitalize">{req.action}</td>
                        <td className="p-3">
                          {req.status === 'pending' && <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 border border-yellow-200">Pending</span>}
                          {req.status === 'approved' && <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-800 border border-green-200">Approved</span>}
                          {req.status === 'rejected' && <span className="inline-block px-2 py-1 text-xs rounded bg-red-100 text-red-800 border border-red-200">Rejected</span>}
                        </td>
                        <td className="p-3">{new Date(req.createdAt).toLocaleString()}</td>
                        <td className="p-3">{req.reviewedBy?.personal_info?.fullname || req.reviewedBy?.personal_info?.email || <span className="text-gray-400">-</span>}</td>
                        <td className="p-3">{req.reviewedAt ? new Date(req.reviewedAt).toLocaleString() : <span className="text-gray-400">-</span>}</td>
                        <td className="p-3 text-center">
                          <button
                            className="w-8 h-8 flex items-center justify-center border border-red-500 bg-white hover:bg-red-100 rounded-full"
                            title="Delete request"
                            onClick={() => handleDeleteRequest(req._id)}
                            disabled={requestsLoading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="red">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Second Tab Content: User Management (same for both admin types) */}
        <div>
          {/* Bulk Actions UI for Super Admins */}
          {superAdmin && selectedUserIds.length > 0 && (
            <div className="mb-4 flex gap-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:opacity-50"
                onClick={() => handleBulkAction('promote')}
                disabled={actionLoading === 'bulk'}
              >
                Promote Selected
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 disabled:opacity-50"
                onClick={() => handleBulkAction('demote')}
                disabled={actionLoading === 'bulk'}
              >
                Demote Selected
              </button>
              <button
                className={`px-4 py-2 rounded shadow ${canDeleteSelected && actionLoading !== 'bulk' ? 'bg-red text-white hover:bg-rose-700' : 'bg-red-200 text-red-400 cursor-not-allowed'}`}
                onClick={() => handleBulkAction('delete')}
                disabled={actionLoading === 'bulk' || !canDeleteSelected}
              >
                Delete Selected
              </button>
            </div>
          )}
          <AdminUserTable
            users={users}
            userAuth={userAuth}
            actionLoading={actionLoading}
            superAdmin={superAdmin}
            handlePromoteDemote={handlePromoteDemote}
            selectedUserIds={selectedUserIds}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
          />
          <Pagination
            page={page}
            limit={limit}
            total={totalUsers}
            onPageChange={setPage}
          />
        </div>
      </InPageNavigation>
    </div>
  );
};

export default UserManagement; 