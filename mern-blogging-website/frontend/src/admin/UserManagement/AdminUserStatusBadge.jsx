import React from "react";

const statusStyles = {
  Active: "bg-green-100 text-green-700",
  Deactivated: "bg-yellow-100 text-yellow-700",
  Deleted: "bg-red-100 text-red-700",
};

export default function AdminUserStatusBadge({ status }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
} 