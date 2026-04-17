# Live Deployment Guide: hr.mosol9.in

This guide provides the exact steps to go live with the HRMS application on the `hr.mosol9.in` subdomain.

## 1. Database Setup (MySQL)

1. **Create a MySQL Database**: Log in to your hosting panel (e.g., cPanel) and create a database named `mosol9_hrms`.
2. **Assign User**: Create a database user and assign them to the database with all privileges.
3. **Import Data**:
   - Open **phpMyAdmin**.
   - Select your new database.
   - Click **Import** and upload the file: `api/full_database_dump.sql`.
   - Click **Go**. This will create all tables and import your existing employees and attendance data.

## 2. Environment Configuration

Create or update the `.env` file in the root of your application on the server:

```env
# Database Credentials
DB_TYPE=mysql
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASS=your_database_password

# Security - Keep this as it was in the local environment
JWT_SECRET=KaphiMosol9_HRMS_Secret_Key_2026_Secure!!

# Frontend pointing to the local API folder
VITE_API_URL=/api
```

## 3. Preparation & Upload

Since this is a React/Vite application, you must build the production bundle locally before uploading.

### A. Run the Build
On your local machine (where `npm` is installed), run:
```bash
npm run build
```
This generates a `dist/` folder.

### B. Upload Files
Upload the following to your server (`public_html/hr/`):

1. **The contents** of the `dist/` folder (everything inside it).
2. **The entire `api/` folder**.
3. **The `.htaccess` file** from the root (ensures proper routing).
4. **The `.env` file**.

Your server file structure should look like this:
```
/ (Root of hr.mosol9.in)
├── index.html
├── assets/
├── .htaccess
├── .env
└── api/
    ├── db.php
    ├── auth.php
    ├── ... (other php files)
    └── logs/ (ensure this folder is writeable)
```

## 4. Final Security Check
- Ensure the `api/logs/` folder has write permissions (usually 755).
- Verify that `https://hr.mosol9.in` loads correctly.
- Test the login with an existing employee or admin account.

---
**Note**: The SQLite `database.db` is still included in the `api/` folder as a backup, but the system is configured to use MySQL for production performance.
