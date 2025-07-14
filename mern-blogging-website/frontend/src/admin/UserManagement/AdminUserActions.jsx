import React from "react";

export default function AdminUserActions({ user, isSelf, isSuper, isAdmin, superAdmin, actionLoading, handlePromoteDemote }) {
  if (isSelf) return <span className="text-gray-400">—</span>;
  if (isSuper) return <span className="text-yellow-700 font-seminormal" title="Super admin cannot be promoted or demoted">Super Admin</span>;
  const isLoading = actionLoading === user._id + (isAdmin ? "-demote" : "-promote");
  return (
    <div className="flex gap-2 justify-center">
      {isAdmin ? (
        <button
          className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-full hover:bg-red-200 focus:ring-2 focus:ring-red-300 transition disabled:opacity-50 shadow-md font-seminormal drop-shadow-sm"
          disabled={isLoading}
          onClick={() => handlePromoteDemote(user._id, false)}
          title={superAdmin ? "Demote from admin" : "Request demotion (super admin approval required)"}
        >
          {isLoading ? "Demoting..." : superAdmin ? "Demote" : "Request Demote"}
        </button>
      ) : (
        <button
          className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-black border border-gray-300 rounded-full hover:bg-gray-200 focus:ring-2 focus:ring-black transition disabled:opacity-50 shadow-md font-normal drop-shadow-sm"
          disabled={isLoading}
          onClick={() => handlePromoteDemote(user._id, true)}
          title={superAdmin ? "Promote to admin" : "Request promotion (super admin approval required)"}
        >
          {isLoading ? "Promoting..." : superAdmin ? "Promote" : "Request Promote"}
        </button>
      )}
    </div>
  );
} 