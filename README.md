# Islamic Stories Admin Panel

A standalone admin panel for managing the Islamic Stories website. This panel is completely independent of the main application and can be deployed separately.

## Features

- **User Management**: View, edit, and manage user accounts
- **Blog Management**: Manage blog posts, drafts, and content
- **Notifications**: Handle system notifications
- **Comments**: Moderate user comments
- **Utilities**: Administrative tools and utilities
- **Standalone Authentication**: Built-in login system
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Backend server running on `http://localhost:3000`

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Create a `.env` file in the root directory:
   ```
   VITE_SERVER_DOMAIN=http://localhost:3000
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the admin panel**:
   Open your browser and go to `http://localhost:5174` (or the port shown in the terminal)

## Usage

### Login

1. Navigate to the admin panel
2. You'll be redirected to the login page
3. Enter your admin credentials (email and password)
4. Only users with admin privileges can access the panel

### Admin Panel Sections

- **User Management**: Manage user accounts, roles, and permissions
- **Blog Management**: Create, edit, and manage blog posts
- **Notifications**: Handle system notifications and alerts
- **Comments**: Moderate and manage user comments
- **Utilities**: Administrative tools and system utilities

### Logout

Click the "Logout" button in the sidebar to sign out and return to the login page.

## Security

- Only admin users can access the panel
- Authentication is handled independently from the main app
- Session management with localStorage
- Automatic redirect to login for unauthenticated users

## Development

### Project Structure

```
admin-panel/
├── src/
│   ├── admin/           # Admin components
│   ├── components/      # Shared components
│   ├── common/          # Utilities and config
│   └── pages/           # Page components
├── admin/               # Additional admin components
└── public/              # Static assets
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment

The admin panel can be deployed independently:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your web server

3. **Configure the backend URL** in your production environment

## Troubleshooting

### Common Issues

1. **"userAuth is null"**: This means no user is logged in. Use the login page to authenticate.

2. **"Access denied"**: Only admin users can access the panel. Make sure your account has admin privileges.

3. **API connection errors**: Ensure the backend server is running on the correct URL.

4. **Environment variables**: Make sure `VITE_SERVER_DOMAIN` is set correctly in your `.env` file.

## Support

For issues or questions, please check the main project documentation or contact the development team. 