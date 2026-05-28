# Admin Setup Instructions for Santhosh@axigear.in

## Summary of Changes Made

The authentication system has been updated to properly recognize and grant admin access to employees with the "Admin" role. Here are the key changes:

### 1. **Enhanced Authentication System** (`client/lib/auth.ts`)
- Added new `isAdminUser()` function that checks both Supabase users and employee sessions
- Employee sessions can now include an `isAdmin` flag and check the `employeeRole`
- Admin employees with "Admin" role are automatically recognized as admins

### 2. **Login Process Updated** (`client/pages/Login.tsx`)
- When an employee logs in via `employee_login`, the system now checks if their role is "Admin"
- If role is "Admin", the `isAdmin` flag is set to true in the employee session

### 3. **Layout Navigation Updated** (`client/components/Layout.tsx`)
- Now uses `isAdminUser()` function instead of simple check for employee session absence
- Admin employees with "Admin" role will see admin menu items (Admin, Settings)

### 4. **Admin Password Dialog Enhanced** (`client/components/AdminPasswordDialog.tsx`)
- Employees with "Admin" role skip the password verification dialog
- Non-admin employees still need to provide admin password (`axigear@2026`)

### 5. **Admin Pages Updated**
- `AdminEmployees.tsx`
- `AdminSettings.tsx`
- `Inventory.tsx`

All now use the `isAdminUser()` function for proper role detection.

### 6. **Server Setup Endpoint Added** (`server/routes/admin-setup.ts`)
- New POST endpoint `/api/admin/setup-employee` to create admin employees
- Can be used during initial setup

---

## How to Create Santhosh as Admin Employee

### Option 1: Via Admin Employees Page (Recommended after first admin is created)

1. Log in with an existing admin account
2. Navigate to **Admin** section
3. Add a new employee with:
   - **Full Name**: Santhosh
   - **Email**: santhosh@axigear.in
   - **Password**: Santhosh@2026
   - **Role**: Admin

### Option 2: Using the Setup Endpoint

Make a POST request to create the admin employee:

```bash
curl -X POST http://localhost:8080/api/admin/setup-employee \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Santhosh",
    "email": "santhosh@axigear.in",
    "password": "Santhosh@2026",
    "role": "Admin"
  }'
```

### Option 3: Using Browser Console (for testing)

Open the browser console on the login page and run:

```javascript
fetch('/api/admin/setup-employee', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Santhosh',
    email: 'santhosh@axigear.in',
    password: 'Santhosh@2026',
    role: 'Admin'
  })
}).then(r => r.json()).then(console.log);
```

---

## Admin Access & Permissions

Once Santhosh is created with "Admin" role, they will have:

✅ **Access to all admin features:**
- Employee Management (`/admin-employees`) - Add, edit, delete employees
- Admin Settings (`/admin-settings`) - Change admin password
- Attendance Management (`/attendance`) - Log and manage employee attendance
- Inventory Management (`/inventory`) - Manage vehicle and spares inventory
- Sales Management (`/sales`) - Add and manage sales/estimations

✅ **Enhanced UI:**
- Admin menu items visible in navigation
- Admin password dialog auto-bypassed (no manual password entry needed)
- Full access to all CRUD operations on admin pages

---

## Login Credentials After Setup

**Email**: `santhosh@axigear.in`
**Password**: `Santhosh@2026`
**Role**: Admin

After logging in with these credentials, Santhosh will:
1. See admin menu items in the navigation (Admin, Settings ⚙️)
2. Have access to all admin pages
3. Be able to manage employees, attendance, inventory, and sales data
4. Not need to enter admin password when accessing restricted sections

---

## Testing the Admin Access

1. **Login**: Enter email and password
2. **Verify Navigation**: Check that "Admin" and "⚙️" appear in the top menu
3. **Access Admin Areas**:
   - Click "Admin" to manage employees
   - Click "⚙️" to access settings
   - Verify admin password dialog is skipped
4. **Manage Data**:
   - Add/edit/delete employees
   - Manage attendance
   - Update inventory
   - Handle sales data

---

## Database Requirements

The system requires the following in Supabase:

1. **employees table** with columns:
   - `id`, `full_name`, `email`, `phone`, `role`, `is_active`, `created_at`

2. **create_employee RPC function** that:
   - Takes: `p_full_name`, `p_email`, `p_password`, `p_phone`, `p_role`
   - Creates an employee record
   - Returns the created employee data

3. **employee_login RPC function** that:
   - Takes: `p_email`, `p_password`
   - Authenticates the employee
   - Returns: `employee_id`, `employee_name`, `employee_role`

---

## Troubleshooting

### Issue: "Santhosh still doesn't have admin access after login"
- **Solution**: Make sure the employee was created with role = "Admin" (exact case matters)
- Verify in Supabase that the `role` field contains "Admin"

### Issue: "Admin password dialog still appears"
- **Solution**: The role must be exactly "Admin" (case-sensitive)
- Check Supabase employees table for the correct role value

### Issue: "Can't create employee via setup endpoint"
- **Solution**: Ensure Supabase credentials are in `.env` file
- Verify the `create_employee` RPC function exists in Supabase

### Issue: "No access to admin pages"
- **Solution**: Check that ProtectedRoute authentication is working
- Verify auth_token is set in localStorage after login

---

## Additional Notes

- The admin system is role-based: employees with "Admin" role in the role field get full admin access
- Supabase users (non-employee) with auth tokens are also treated as admins by default
- The system supports both Supabase auth users and employee-based auth
- All admin data access control is currently UI-level (no server-side authorization enforced yet)

