# Azure App Service Deployment Guide

This guide walks you through moving the Employee Admin Dashboard from Vercel to **Azure App Service** so the app runs entirely within your company's Azure tenant.

---

## Prerequisites

- An **Azure subscription** (your company likely already has one)
- **Azure CLI** installed ([Download](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli))
- The GitHub repo: `omar2ebrahem/proj-ad`

---

## Step 1: Create the Azure App Service

### Option A: Azure Portal (UI)

1. Go to [portal.azure.com](https://portal.azure.com)
2. Click **"Create a resource"** → search **"Web App"**
3. Fill in:
   - **Subscription**: Your company subscription
   - **Resource Group**: Create new or pick existing (e.g., `rg-employee-portal`)
   - **Name**: Choose a unique name (e.g., `employee-portal-yourcompany`) — this becomes `https://employee-portal-yourcompany.azurewebsites.net`
   - **Runtime stack**: **Node 18 LTS**
   - **Operating System**: **Linux**
   - **Region**: Choose closest to your company (e.g., `West Europe`)
   - **Pricing plan**: **B1 (Basic)** is enough to start — ~€12/month
4. Click **Review + Create** → **Create**

### Option B: Azure CLI (Command Line)

```bash
# Login to Azure
az login

# Create a resource group (skip if you have one)
az group create --name rg-employee-portal --location westeurope

# Create an App Service Plan (Linux, Basic tier)
az appservice plan create \
  --name plan-employee-portal \
  --resource-group rg-employee-portal \
  --sku B1 \
  --is-linux

# Create the Web App
az webapp create \
  --name employee-portal-yourcompany \
  --resource-group rg-employee-portal \
  --plan plan-employee-portal \
  --runtime "NODE:18-lts"
```

---

## Step 2: Configure Environment Variables

In the Azure Portal:

1. Go to your **Web App** → **Settings** → **Configuration** → **Application settings**
2. Add each of these as a **New application setting**:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_CLIENT_ID` | Your Entra ID App Registration Client ID |
| `NEXT_PUBLIC_TENANT_ID` | Your Azure AD Tenant ID |
| `NEXT_PUBLIC_AUTHORITY` | `https://login.microsoftonline.com/YOUR_TENANT_ID` |
| `SERVICE_PRINCIPAL_CLIENT_ID` | Backend service principal Client ID |
| `SERVICE_PRINCIPAL_CLIENT_SECRET` | Backend service principal Secret |
| `ALLOWED_SECURITY_GROUP_ID` | Object ID of the allowed security group |
| `WEBSITE_NODE_DEFAULT_VERSION` | `18-lts` |

Or via Azure CLI:
```bash
az webapp config appsettings set \
  --name employee-portal-yourcompany \
  --resource-group rg-employee-portal \
  --settings \
    NEXT_PUBLIC_CLIENT_ID="your-client-id" \
    NEXT_PUBLIC_TENANT_ID="your-tenant-id" \
    NEXT_PUBLIC_AUTHORITY="https://login.microsoftonline.com/your-tenant-id" \
    SERVICE_PRINCIPAL_CLIENT_ID="your-sp-client-id" \
    SERVICE_PRINCIPAL_CLIENT_SECRET="your-sp-secret" \
    ALLOWED_SECURITY_GROUP_ID="your-group-id"
```

---

## Step 3: Configure Startup Command

Azure needs to know how to start the Next.js app.

1. In the Azure Portal → your Web App → **Settings** → **Configuration** → **General settings**
2. Set **Startup Command** to:
   ```
   npm run start
   ```

Or via CLI:
```bash
az webapp config set \
  --name employee-portal-yourcompany \
  --resource-group rg-employee-portal \
  --startup-file "npm run start"
```

---

## Step 4: Update Entra ID Redirect URIs

1. Go to [Azure Portal](https://portal.azure.com) → **Entra ID** → **App registrations**
2. Select your app (`f5ad5320-fecc-469e-8a3b-e58691ea632e`)
3. Go to **Authentication** → **Platform configurations** → **Web**
4. Add your new Azure App Service URL as a redirect URI:
   ```
   https://employee-portal-yourcompany.azurewebsites.net
   ```
5. (Optional) Remove the old Vercel URL if you no longer need it
6. Click **Save**

---

## Step 5: Deploy via GitHub Actions (Automated CI/CD)

A GitHub Actions workflow file has been created at `.github/workflows/azure-deploy.yml`.

### 5a. Get the Publish Profile

1. In Azure Portal → your Web App → **Overview** → click **"Download publish profile"**
2. Open the downloaded file in a text editor and copy the entire contents

### 5b. Add Secrets to GitHub

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these **Repository secrets**:

| Secret Name | Value |
|-------------|-------|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Paste the entire publish profile XML |
| `NEXT_PUBLIC_CLIENT_ID` | Your Entra ID Client ID |
| `NEXT_PUBLIC_TENANT_ID` | Your Tenant ID |
| `NEXT_PUBLIC_AUTHORITY` | `https://login.microsoftonline.com/YOUR_TENANT_ID` |

3. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables** tab
4. Add a **Repository variable**:

| Variable Name | Value |
|---------------|-------|
| `AZURE_WEBAPP_NAME` | `employee-portal-yourcompany` |

### 5c. Push and Deploy

Every push to `main` will now automatically build and deploy to Azure. You can also manually trigger it from the **Actions** tab → **Deploy to Azure App Service** → **Run workflow**.

---

## Step 6: (Optional) Custom Domain & SSL

If you want to use a company domain like `portal.yourcompany.de`:

1. Azure Portal → your Web App → **Settings** → **Custom domains**
2. Click **"Add custom domain"**
3. Add a **CNAME** record in your DNS:
   ```
   portal  CNAME  employee-portal-yourcompany.azurewebsites.net
   ```
4. Azure will auto-provision a free SSL certificate, or you can upload your own

---

## Verification

After deployment, verify:

1. ✅ `https://employee-portal-yourcompany.azurewebsites.net` loads the login page
2. ✅ Microsoft sign-in redirects correctly (check redirect URI in Entra ID)
3. ✅ Employee search and profile editing works
4. ✅ All text is in German with yellow/gray branding

---

## Costs

| Resource | Estimated Monthly Cost |
|----------|----------------------|
| App Service (B1 Basic) | ~€12/month |
| Custom Domain SSL | Free (managed cert) |
| Total | **~€12/month** |

You can scale up to **S1 Standard** (~€65/month) later if you need auto-scaling, deployment slots, or higher traffic support.
