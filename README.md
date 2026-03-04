# Employee Admin Dashboard for Microsoft Entra ID

A modern web application for HR/IT admins to manage employee profiles in Microsoft Entra ID using Microsoft Graph API.

## Features

✅ Microsoft 365 Authentication (MSAL)
✅ Search employees by name or email
✅ Edit employee attributes in 3 sections:
   - Personal Info (Name, Email, Phones, Location)
   - Work Info (Title, Department, Manager, Company)
   - Address Info (Street, City, State, Zip, Country)
✅ Review changes before saving
✅ Audit logging
✅ Security group access control

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Microsoft Entra ID (See SETUP.md)

### 3. Run Locally
```bash
npm run dev
# Visit http://localhost:3000
```

### 4. Deploy to Azure App Service (See DEPLOYMENT.md)

## Project Structure

```
employee-admin-dashboard/
├── lib/              # TypeScript utilities
├── pages/            # Next.js pages & API routes
├── components/       # React components
├── styles/           # CSS modules
├── public/           # Static assets
├── .env.local        # Environment variables
└── package.json      # Dependencies
```

## Documentation

- [Setup Guide](./SETUP.md) - Configure Microsoft Entra ID
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to Azure
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues

## License

MIT