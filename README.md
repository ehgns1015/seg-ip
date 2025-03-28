# IP Management System

## 🚨 IMPORTANT: Development Workflow 🚨

**NEVER make changes directly to the `main` branch!**

Always follow these steps when making changes:
1. Create a new branch with a descriptive name related to your changes (e.g., `feature/add-unit-validation`, `bugfix/fix-ip-duplicate-check`)
2. Make your changes in this branch
3. Test your changes thoroughly
4. Create a pull request to merge your branch into `main`
5. Wait for review and approval before merging

Failure to follow this workflow may result in code conflicts, lost work, or application instability.

## Project Overview

This IP Management System is designed to track and manage IP addresses, computer units (both employee machines and other networked devices), and inventory items across multiple locations. It provides a comprehensive solution for tracking technology assets and supplies.

## Features

### IP Management
- View all available IP addresses in the network
- Create and manage units (employees and machines) with their respective IP addresses
- Validate IP addresses to prevent duplicates
- Support for shared computers with primary user tracking
- Detailed unit information tracking

### Inventory Management
- Track inventory items across multiple locations (Wiley, Redding, Jane)
- Monitor item quantities and status
- End-of-stock (EOS) indicators
- Item history with timestamps
- Notes and additional information for each item

## Technologies Used

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Not implemented (consider adding)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB instance
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://SeoyonehwaGA@github.com/SeoyonehwaGA/seg-ip.git
   cd seg-ip
   ```

2. Install dependencies
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```
   2-1. Token is required to clone. Ask Token to IT team

3. Set up environment variables (see below)

4. Run the development server
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
MONGODB_URL=your_mongodb_connection_string
DB_NAME=your_database_name

# Employee fields configuration - JSON array of field configurations
NEXT_PUBLIC_EMPLOYEE_FIELDS=[{"name":"name","type":"text"},{"name":"ip","type":"text"},{"name":"department","type":"text"},{"name":"MAC","type":"text"},{"name":"email","type":"text"},{"name":"sharedComputer","type":"checkbox"},{"name":"primaryUser","type":"select"},{"name":"note","type":"textarea"}]

# Machine fields configuration - JSON array of field configurations
NEXT_PUBLIC_MACHINE_FIELDS=[{"name":"name","type":"text"},{"name":"ip","type":"text"},{"name":"line","type":"text"},{"name":"device","type":"text"},{"name":"MAC","type":"text"},{"name":"username","type":"text"},{"name":"pw","type":"text"},{"name":"note","type":"textarea"}]

# Gateways configuration - JSON array of gateway objects with IP and range
NEXT_PUBLIC_GATEWAYS=[{"ip":"192.168.1.1","range":254},{"ip":"192.168.2.1","range":254}]
```

## Project Structure

```
app/
├── api/                  # API routes for backend functionality
│   ├── inventory/        # Inventory API endpoints
│   └── units/            # Units API endpoints
├── components/           # Reusable React components
├── functions/            # Utility functions
├── hooks/                # Custom React hooks
├── lib/                  # Library code (database connection, etc.)
├── models/               # Data models
├── services/             # API service functions for frontend
└── types/                # TypeScript type definitions
```

## API Endpoints

### Units API

- `GET /api/units` - Get all units
- `POST /api/units` - Create a new unit
- `GET /api/units/[name]` - Get a specific unit by name
- `PUT /api/units/[name]` - Update a unit
- `DELETE /api/units/[name]` - Delete a unit
- `POST /api/units/check-ip` - Check if an IP address is available

### Inventory API

- `GET /api/inventory` - Get all inventory items (can filter by location)
- `POST /api/inventory` - Create a new inventory item
- `GET /api/inventory/[item]` - Get a specific inventory item
- `PUT /api/inventory/[item]` - Update an inventory item
- `DELETE /api/inventory/[item]` - Delete an inventory item

## Contributing

1. **Always create a new branch for your changes**
   ```
   git checkout -b feature/your-feature-name
   ```

2. Make your changes in this branch

3. Test your changes thoroughly

4. Submit a pull request to the `main` branch

5. Wait for review and approval

## License

Seoyon E-hwa Georgia
