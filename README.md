# TRADon Admin Panel

Modern admin dashboard for managing TRADon e-commerce platform.

## Features

- 📊 Dashboard with key metrics
- 📦 Product Management (Create, Edit, Delete)
- 📋 Order Management
- 👥 User Management
- 📈 Analytics & Reports
- 🔐 Secure Admin Authentication

## Setup

### Prerequisites
- Node.js 16+
- Backend server running on http://localhost:5000

### Installation

```bash
cd admin
npm install
```

### Development

```bash
npm run dev
```

Admin panel will be available at `http://localhost:5174`

### Admin Credentials (Demo)
- Email: `admin@tradon.com`
- Password: `admin123`

## Project Structure

```
admin/
├── src/
│   ├── components/        # Reusable components
│   ├── context/          # React context (Auth)
│   ├── pages/            # Page components
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── index.html
└── vite.config.js
```

## API Integration

The admin panel connects to the backend API at `/api/`:

- **Auth**: POST `/api/auth/admin-login` - Admin login
- **Auth**: GET `/api/auth/users` - Fetch all users
- **Products**: GET `/api/products` - List products
- **Products**: POST `/api/products` - Create product
- **Products**: PUT `/api/products/:id` - Update product
- **Products**: DELETE `/api/products/:id` - Delete product
- **Orders**: GET `/api/orders` - List orders
- **Admin**: GET `/api/admin/stats` - Dashboard statistics

## Build

```bash
npm run build
```

Production build will be in the `dist/` folder.

## Technologies

- React 18
- Vite
- Tailwind CSS
- Lucide Icons
- Axios
- React Router
- React Toastify

## Security Notes

- Use environment variables for sensitive data
- Implement JWT token refresh mechanism
- Add role-based access control (RBAC)
- Validate all inputs on backend
- Enable HTTPS in production
