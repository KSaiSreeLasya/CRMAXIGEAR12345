# Leads Table Schema Documentation

## Table Overview

The `leads` table stores customer information and remarks for the "Leads Required" module.

### Quick Facts:
- **Table Name**: `public.leads`
- **Purpose**: Track customer information with multiple remarks/notes
- **Data Isolation**: User-based (each user sees only their leads)
- **Availability**: All CRUD operations (Create, Read, Update, Delete)

---

## Table Structure

```sql
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  phone_no TEXT NOT NULL,
  remark1 TEXT,
  remark2 TEXT,
  remark3 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Column Definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier (auto-generated) |
| `user_id` | UUID | NOT NULL | User who created/owns this lead |
| `customer_name` | TEXT | NOT NULL | Customer's full name (required) |
| `phone_no` | TEXT | NOT NULL | Customer's phone number (required) |
| `remark1` | TEXT | NULLABLE | First note/remark about the customer |
| `remark2` | TEXT | NULLABLE | Second note/remark about the customer |
| `remark3` | TEXT | NULLABLE | Third note/remark about the customer |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp (auto) |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Record update timestamp (auto) |

---

## Indexes

Indexes are created for optimal query performance:

```sql
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_leads_customer_name ON public.leads(customer_name);
CREATE INDEX idx_leads_phone_no ON public.leads(phone_no);
```

### Index Purposes:

| Index | Columns | Purpose | Usage |
|-------|---------|---------|-------|
| `idx_leads_user_id` | `user_id` | Fast user data isolation | Filtering leads by user |
| `idx_leads_created_at` | `created_at` | Efficient sorting | Ordering by creation date |
| `idx_leads_customer_name` | `customer_name` | Search performance | Full-text search by name |
| `idx_leads_phone_no` | `phone_no` | Phone lookup | Searching by phone number |

---

## Row Level Security (RLS) Policies

All RLS policies enforce user-based data isolation:

### Policy 1: SELECT (View)
```sql
CREATE POLICY "Users can view their own leads"
  ON public.leads
  FOR SELECT
  USING (user_id = auth.uid());
```
**Effect**: Users can only see leads they created

### Policy 2: INSERT (Create)
```sql
CREATE POLICY "Users can create leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
```
**Effect**: Users can only create leads under their own `user_id`

### Policy 3: UPDATE (Edit)
```sql
CREATE POLICY "Users can update their own leads"
  ON public.leads
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```
**Effect**: Users can only modify their own leads

### Policy 4: DELETE (Remove)
```sql
CREATE POLICY "Users can delete their own leads"
  ON public.leads
  FOR DELETE
  USING (user_id = auth.uid());
```
**Effect**: Users can only delete their own leads

---

## Example Data

### Sample Insert:
```sql
INSERT INTO public.leads (
  user_id,
  customer_name,
  phone_no,
  remark1,
  remark2,
  remark3
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Rajesh Kumar',
  '+91-9876543210',
  'Interested in EV bikes',
  'Budget: 2-3 lakhs',
  'Follow up after 1 week'
);
```

### Sample Query Results:
```
id                                    user_id                            customer_name  phone_no         remark1                  remark2              remark3           created_at
550e8400-e29b-41d4-a716-446655440001  550e8400-e29b-41d4-a716-446655440000  Rajesh Kumar   +91-9876543210   Interested in EV bikes   Budget: 2-3 lakhs   Follow up...      2026-07-21 10:21:00+00
```

---

## Common Queries

### 1. Create a New Lead
```sql
INSERT INTO public.leads (user_id, customer_name, phone_no, remark1, remark2, remark3)
VALUES ('user-uuid', 'Customer Name', '+91-1234567890', 'Remark 1', 'Remark 2', 'Remark 3');
```

### 2. View All Your Leads
```sql
SELECT id, customer_name, phone_no, remark1, remark2, remark3, created_at
FROM public.leads
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### 3. Search for a Lead by Name
```sql
SELECT * FROM public.leads
WHERE user_id = auth.uid()
AND customer_name ILIKE '%search_term%'
ORDER BY created_at DESC;
```

### 4. Search for a Lead by Phone Number
```sql
SELECT * FROM public.leads
WHERE user_id = auth.uid()
AND phone_no LIKE '%phone_search%';
```

### 5. Update a Lead
```sql
UPDATE public.leads
SET customer_name = 'New Name',
    remark1 = 'Updated remark 1',
    remark2 = 'Updated remark 2',
    updated_at = NOW()
WHERE id = 'lead-uuid'
AND user_id = auth.uid();
```

### 6. Delete a Lead
```sql
DELETE FROM public.leads
WHERE id = 'lead-uuid'
AND user_id = auth.uid();
```

### 7. Get Leads Created in Last 7 Days
```sql
SELECT * FROM public.leads
WHERE user_id = auth.uid()
AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### 8. Count Total Leads
```sql
SELECT COUNT(*) as total_leads
FROM public.leads
WHERE user_id = auth.uid();
```

---

## Migration Instructions

### Step 1: Apply Migration
The migration file `supabase/migrations/008_create_leads_table.sql` will automatically be applied when you:
- Push code to production
- Or manually run it in your Supabase SQL editor

### Step 2: Verify Creation
Run this query to confirm the table exists:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'leads';
```

### Step 3: Check Policies
Verify RLS policies are enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'leads';
-- Should show: leads | true
```

---

## UI Integration

The Leads table is accessed through:
- **Page**: `client/pages/Leads.tsx`
- **Route**: `/leads`
- **Dashboard Link**: "LEADS REQUIRED" tile with Target icon

### Operations in UI:

| Operation | SQL | UI Action |
|-----------|-----|-----------|
| Create | INSERT | Click "+ Add Lead" → Fill form → Click "Save Lead" |
| Read | SELECT | View table with all leads |
| Update | UPDATE | Click "Edit" on lead → Update form → Click "Update Lead" |
| Delete | DELETE | Click "Delete" on lead → Confirm → Lead removed |

---

## Performance Considerations

### Query Performance:
- ✅ Indexed on `user_id` for fast user isolation
- ✅ Indexed on `customer_name` for search performance
- ✅ Indexed on `phone_no` for lookup performance
- ✅ Indexed on `created_at` for sorting operations

### Optimization Tips:
1. **Use Indexes**: Always filter by `user_id` first
2. **Pagination**: For large datasets, implement pagination in the UI
3. **Caching**: Frontend caches leads in React state
4. **Subscriptions**: Real-time updates via Supabase subscriptions

---

## Backup & Recovery

### Backup:
```sql
-- Export all leads to CSV
COPY (SELECT * FROM public.leads) 
TO '/tmp/leads_backup.csv' 
WITH (FORMAT CSV, HEADER);
```

### Recovery:
```sql
-- Import leads from CSV
COPY public.leads(id, user_id, customer_name, phone_no, remark1, remark2, remark3, created_at, updated_at)
FROM '/tmp/leads_backup.csv' 
WITH (FORMAT CSV, HEADER);
```

---

## Troubleshooting

### Issue: Can't insert a lead
**Solution**: Check that `user_id` is set correctly and matches the authenticated user

### Issue: Can't see leads from another user
**Solution**: RLS policies prevent cross-user data access (this is intentional)

### Issue: Slow search queries
**Solution**: Ensure indexes are created and use ILIKE for case-insensitive search

### Issue: Phone number format inconsistencies
**Solution**: Store phone numbers consistently (e.g., always with country code)

---

## Related Tables

The leads table is independent but can be linked to:
- **projects table**: For converting leads to completed sales
- **estimations table**: For estimation requests from leads
- **transactions table**: For payment tracking if lead converts

---

## Future Enhancements

Possible future additions:
1. Lead Status (New, Contacted, Qualified, etc.)
2. Lead Source tracking
3. Follow-up date scheduling
4. Attachment/document storage
5. Lead scoring system
6. Conversion to Sales tracking
7. Lead assignment to team members

---

## Data Types Reference

| Type | Size | Use Case |
|------|------|----------|
| UUID | 16 bytes | Unique identifiers |
| TEXT | Variable | Names, phone, remarks |
| TIMESTAMP | 8 bytes | Dates and times |

---

## Summary

The `leads` table provides a secure, indexed, user-isolated storage for customer information with support for detailed remarks. It's fully integrated with the application's UI and includes comprehensive RLS policies for data security.

For questions or issues, refer to the implementation documentation or check the AGENTS.md file for project structure guidelines.
