# Quick Start Guide - Leads Module with WhatsApp

## For Users - How to Use

### ✅ Access the Leads Module
1. Go to Dashboard
2. Click **"LEADS REQUIRED"** tile
3. Or navigate directly to `/leads`

---

### ➕ Add a New Lead
1. Click **"+ Add Lead"** button
2. Fill in:
   - **Customer Name** (required)
   - **Phone No.** (required, e.g., +91-9876543210)
   - **Remark 1** (optional)
   - **Remark 2** (optional)
   - **Remark 3** (optional)
3. Click **"Save Lead"**
4. Lead appears in table

---

### 👁️ View Lead Details
1. Click **"View"** button on any lead row
2. Detail modal opens showing:
   - Full customer information
   - Complete remarks (not truncated)
   - Creation date
3. See three action buttons at bottom

---

### 📱 Share to WhatsApp
1. Open lead details (click "View")
2. Click **"Share to WhatsApp"** button (green)
3. WhatsApp opens automatically with:
   - Customer's phone number
   - Pre-filled welcome message from Axigear
4. Review message and click "Send"
5. Message delivered! ✅

**Message Sent**:
```
🌿 Greetings from Axigear Electric Lounge!
Wishing you happiness, good health, and safe journeys.
We are excited to announce the arrival of the latest models 
at our showroom. Visit us today to explore the latest collection, 
enjoy a test ride, and experience the future of eco-friendly mobility.
We look forward to welcoming you!
– Team Axigear Electric Lounge
```

---

### ✏️ Edit a Lead
**From Table:**
1. Click **"Edit"** button on lead row
2. Edit form appears with current data
3. Make changes
4. Click **"Update Lead"**

**From Detail Modal:**
1. Open lead details
2. Click **"Edit"** button
3. Edit form appears
4. Make changes
5. Click **"Update Lead"**

---

### 🗑️ Delete a Lead
**From Table:**
1. Click **"Delete"** button
2. Confirm deletion
3. Lead is removed

**From Detail Modal:**
1. Open lead details
2. Click **"Delete"** button
3. Confirm deletion
4. Lead is removed and modal closes

---

### 🔍 Search Leads
1. Use search bar at top
2. Type customer name or phone number
3. Table filters in real-time
4. Click **X** to clear search

---

## Table Overview

| Column | What It Shows |
|--------|---------------|
| Customer Name | Full name of the lead |
| Phone No. | Contact phone number |
| Remark 1 | First note (truncated) |
| Remark 2 | Second note (truncated) |
| Remark 3 | Third note (truncated) |
| Created | Date lead was created |
| Actions | View, Edit, Delete buttons |

---

## Button Guide

| Button | Location | What It Does | Icon |
|--------|----------|--------------|------|
| **+ Add Lead** | Header | Opens form to create new lead | Plus |
| **View** | Table actions | Opens detail modal | Eye |
| **Edit** | Table/Modal actions | Opens edit form | Edit |
| **Delete** | Table/Modal actions | Removes lead after confirmation | Trash |
| **Share to WhatsApp** | Detail modal | Sends welcome message via WhatsApp | Message |

---

## Tips & Tricks

### 💡 Best Practices
- Always include country code in phone (+91 for India)
- Use remarks to track follow-ups
- Regularly reach out to cold leads with WhatsApp

### 🎯 Use Cases for Remarks
- **Remark 1**: What vehicle they're interested in
- **Remark 2**: Budget/price expectation
- **Remark 3**: Best time to follow up

### ⚡ Quick Workflow
```
Add Lead
   ↓
Add remarks about their interest
   ↓
Share WhatsApp message
   ↓
Wait for customer response
   ↓
Edit remarks with follow-up info
   ↓
When they buy → Move to "Sales Done"
```

---

## FAQs

### Q: Why won't WhatsApp open?
**A**: 
- Check WhatsApp is installed (desktop) or WhatsApp Web is active
- Try opening manually from phone
- Ensure phone number has country code

### Q: Can I change the WhatsApp message?
**A**: 
- Currently, message is fixed
- Contact admin to customize message

### Q: Where is my data saved?
**A**: 
- Primary: Supabase database
- Backup: Browser localStorage
- All data is your company's, we don't store copies

### Q: Can multiple users manage leads?
**A**: 
- Yes, each user sees only their own leads
- Leads are isolated by user account

### Q: How do I export leads?
**A**: 
- Currently not available
- Can copy data from table manually
- Future: CSV export coming soon

### Q: What if I accidentally delete a lead?
**A**: 
- Confirmation dialog appears first
- After deletion, cannot recover from UI
- Contact admin for database recovery

---

## Phone Number Formats Accepted

All of these work:
```
+91-9876543210      ✅ Best
+919876543210       ✅ Good
+91 9876543210      ✅ Good
09876543210         ⚠️ Works (missing country code)
9876543210          ⚠️ Works (missing country code)
+1-800-AXIGEAR      ❌ (Letters not supported)
```

**Recommendation**: Always use `+91-XXXXXXXXXX` format for India

---

## Troubleshooting

### Issue: Can't create new lead
**Solution**: 
- Check internet connection
- Ensure you're logged in
- Try refreshing page
- Check browser console for errors

### Issue: WhatsApp message looks weird
**Solution**: 
- Check your phone's character encoding
- Try opening in different browser
- Message might wrap differently in WhatsApp

### Issue: Searched for lead but can't find it
**Solution**: 
- Check spelling of name/phone
- Use only name or phone, not both
- Clear search and scroll through all leads

### Issue: Can't edit a lead I just created
**Solution**: 
- Refresh page first
- Check if you're logged in
- Verify lead appears in table

---

## Keyboard Shortcuts (Future)

Not available yet, but planned:
- `Ctrl+N` → Add new lead
- `Ctrl+K` → Focus search
- `Esc` → Close modal
- `/` → Focus search

---

## Mobile Tips

### On Smartphone
1. Leads module fully mobile responsive
2. Swipe to see more columns
3. Tap "View" → Opens modal easily
4. "Share WhatsApp" → Opens app directly
5. Edit/Delete buttons stay accessible

### On Tablet
1. Full layout viewable
2. All features easily accessible
3. Large touch targets
4. Good for demo/presentation

---

## For Administrators

### Customizing the Welcome Message
To change the WhatsApp message sent to customers:

1. Open: `client/pages/Leads.tsx`
2. Find: Line 27 (look for `WHATSAPP_MESSAGE`)
3. Edit the text between the backticks:
```typescript
const WHATSAPP_MESSAGE = `🌿 YOUR NEW MESSAGE HERE`;
```
4. Deploy changes
5. New message will be used for all future shares

### Adding More Remark Fields
To add a 4th remark field:
1. Database: Add `remark4` column to leads table
2. Frontend: Update Lead interface
3. Add form field in add/edit form
4. Update detail modal to show remark4
5. Deploy

---

## Performance

- **Load**: < 1 second for typical list
- **Search**: Instant (real-time)
- **WhatsApp Open**: < 1 second
- **Add Lead**: < 2 seconds
- **Delete**: Instant (with confirmation)

---

## Data Privacy

✅ Your data stays in your Supabase
✅ No tracking or analytics
✅ Phone numbers not shared with WhatsApp API
✅ Only link opens, no data sent
✅ All data encrypted in transit

---

## Support

### For Technical Issues
- Check browser console (F12)
- Verify internet connection
- Try different browser
- Clear cache and cookies
- Refresh page

### For Feature Requests
- Document what you want
- Explain use case
- Share mockups if possible
- Submit to development team

---

## Keyboard & Accessibility

### Using Tab Key
- Tab through form fields
- Tab through buttons
- Enter to submit forms
- Esc to close modals

### Screen Readers
- All buttons have labels
- Form fields have labels
- Images have alt text
- Modal has clear structure

---

## Summary

**What You Can Do:**
✅ Add leads with customer info & remarks
✅ View full lead details in modal
✅ Share WhatsApp messages directly
✅ Edit lead information anytime
✅ Delete old/duplicate leads
✅ Search by name or phone
✅ See all leads in organized table

**What's Automatic:**
✅ Data saves to database
✅ Real-time sync
✅ Timestamps tracking
✅ Phone number formatting

**What to Remember:**
✅ Always use +country code for phone
✅ Use remarks to track important info
✅ Share WhatsApp for quick follow-up
✅ Regularly manage your leads

---

## Getting Help

1. **Read this guide first** (you probably found the answer here!)
2. **Check FAQs section** above
3. **Try troubleshooting steps** for your issue
4. **Contact your admin** if still stuck
5. **Check browser console** for error messages

---

**Happy Selling! 🚀**

The Leads Required module is designed to help you manage and engage with customers efficiently. Use it daily to stay on top of your opportunities and convert leads to sales!
