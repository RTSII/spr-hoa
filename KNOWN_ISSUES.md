# Known Issues

**2025-07-27 Update:**
- All critical CSS/TS errors are resolved.
- If you encounter build or runtime errors, see DEV_SERVER_TROUBLESHOOTING.md.
- Minor warnings (e.g. unused vars) may appear but do not block build.
 and Development Notes

## LightningCSS Native Module Issue on Windows

### Issue
The local development server for the Sandpiper Run Unit Access Request Form project on Windows was failing to start due to a missing native module error related to lightningcss (`lightningcss.win32-x64-msvc.node`).

### Cause
This is a known issue with rollup dependencies and native modules on Windows when using npm.

### Attempts to Fix
- Running `npm run dev` and `npx vite` resulted in the same error.
- Installing missing rollup dependencies did not resolve the issue.
- A manual Vite start script also failed to bypass the error.

### Resolution
Switching to Yarn for dependency management and running the dev server resolved the issue. Yarn handles native dependencies better on Windows in this context.

### Outcome
The dev server started successfully, and the application loaded the initial page with the Sandpiper Run logo and email entry form.

### Best Practices to Avoid Similar Issues
- Prefer using Yarn over npm on Windows for this project to avoid native module issues.
- Keep dependencies updated and monitor lightningcss and related packages for Windows compatibility improvements.
- Consider containerized or online development environments to avoid local environment inconsistencies.
- Document this known issue and resolution in project documentation for future developers.

---

# Additional Tips for Project Development
- Regularly run `yarn install` and `yarn dev` to ensure dependencies and dev server work correctly.
- Use environment variables and configuration files to manage different environments (development, staging, production).
- Test deployment on platforms like Vercel or Netlify as an alternative to local development.
- Maintain clear documentation for setup, troubleshooting, and deployment.

---

# Admin Registration Steps

To register as an Admin for the Sandpiper Run Unit Access Request Form project:

1. Review the admin setup documentation such as `ADMIN_SETUP_GUIDE.md` and SQL scripts like `admin-setup-simple.sql` or `admin-setup-final.sql` in the `sandpiper-portal` folder.
2. Run the necessary database setup scripts to create admin roles and permissions.
3. Access the admin registration or login page in the application.
4. Register a new admin user with required credentials.
5. Verify admin access by logging in and confirming admin privileges.
6. Ensure Supabase authentication and roles are configured correctly as per the `SUPABASE_SETUP_GUIDE.md`.

If you want, I can help you with the exact commands or steps to run the admin setup scripts and register as an admin.

---

This document will help future developers understand the known issues, resolutions, and next steps for development and admin registration.
