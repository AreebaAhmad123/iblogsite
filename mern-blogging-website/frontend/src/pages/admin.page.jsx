import { useState } from 'react';
import UserManagement from '../admin/UserManagement';
import BlogManagement from '../admin/BlogManagement';
import AdminUtilities from '../admin/AdminUtilities';
import AdminNotifications from '../admin/AdminNotifications';
import AdminComments from '../admin/AdminComments';

const sections = [
  {
    key: 'users',
    label: 'User Management',
    icon: (
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z" fill="currentColor"/></svg>
    ),
  },
  {
    key: 'blogs',
    label: 'Blog Management',
    icon: (
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v2H4zm0 4h16v2H4zm0 4h10v2H4zm0 4h10v2H4z" fill="currentColor"/></svg>
    ),
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: (
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none"><path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/></svg>
    ),
  },
  {
    key: 'comments',
    label: 'Comments',
    icon: (
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none"><path d="M21 6h-2V4a2 2 0 00-2-2H7a2 2 0 00-2 2v2H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V8a2 2 0 00-2-2zm-2 0H5V4h14v2zm2 12H3V8h18v10z" fill="currentColor"/></svg>
    ),
  },
  {
    key: 'utilities',
    label: 'Utilities',
    icon: (
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none"><path d="M19.14 12.94a1.5 1.5 0 00-2.12 0l-1.42 1.42-2.12-2.12 1.42-1.42a1.5 1.5 0 000-2.12l-2.12-2.12a1.5 1.5 0 00-2.12 0l-1.42 1.42-2.12-2.12 1.42-1.42a1.5 1.5 0 000-2.12l-2.12-2.12a1.5 1.5 0 00-2.12 0l-1.42 1.42-2.12-2.12 1.42-1.42a1.5 1.5 0 000-2.12l-2.12-2.12a1.5 1.5 0 00-2.12 0l-1.42 1.42-2.12-2.12 1.42-1.42a1.5 1.5 0 000-2.12l-2.12-2.12a1.5 1.5 0 00-2.12 0l-1.42 1.42-2.12-2.12 1.42-1.42a1.5 1.5 0 000-2.12l-2.12-2.12a1.5 1.5 0 00-2.12 0l-1.42 1.42-2.12-2.12 1.42-1.42a1.5 1.5 0 000-2.12l-2.12-2.12a1.5 1.5 0 00-2.12 0l-1.42 1.42-2.12-2.12 1.42-1.42a1.5 1.5 0 000-2.12l-2.12-2.12a1.5 1.5 0 00-2.12 0l-1.42 1.42-2.12-2.12 1.42-1.42a1.5 1.5 0 000-2.12l-2.12-2.12a1.5 1.5 0 00-2.12 0l-1.42 1.42-2.12-2.12 1.42-1.42a1.5 1.5 0 000-2.12z" fill="currentColor"/></svg>
    ),
  },
];

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('users');

  return (
    <div className="w-full max-w-[1400px] mx-auto px-[5vw]">
      <div className="admin-panel-container flex min-h-screen bg-gray-50">
        {/* Sidebar Navigation */}
        <aside className="w-72 bg-white border-r shadow-lg p-0 flex flex-col gap-0 rounded-r-3xl min-h-screen">
          
          <div className="flex items-center gap-3 px-8 py-8 border-b">
          </div>
          <nav className="flex-1 flex flex-col gap-2 py-8 px-4">
            {sections.map((section) => (
              <button
                key={section.key}
                className={`flex items-center w-full px-5 py-3 my-1 rounded-xl font-medium text-lg transition-all duration-150 group relative
                  ${activeSection === section.key
                    ? 'bg-gray-200 text-black font-bold shadow-md border-l-4 border-black'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-black'}
                `}
                onClick={() => setActiveSection(section.key)}
              >
                <span className={`transition-colors duration-150 ${activeSection === section.key ? 'text-black' : 'text-gray-400 group-hover:text-black'}`}>{section.icon}</span>
                {section.label}
                {activeSection === section.key && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-black rounded-r-xl" />
                )}
              </button>
            ))}
          </nav>
          <div className="mt-auto py-6 px-8 border-t text-xs text-gray-400">&copy; {new Date().getFullYear()} IslamicStories Admin</div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeSection === 'users' && <UserManagement />}
          {activeSection === 'blogs' && <BlogManagement />}
          {activeSection === 'notifications' && <AdminNotifications />}
          {activeSection === 'comments' && <AdminComments />}
          {activeSection === 'utilities' && <AdminUtilities />}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel; 