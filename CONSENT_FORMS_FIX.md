# Consent Forms Database Migration

## 🚨 Problem Identified

The consent forms system was using **in-memory storage** (`Map` objects in Node.js memory) instead of the database. This caused critical issues:

### Issues:
1. ❌ **Completed forms disappeared** after server restarts
2. ❌ **PDF viewer didn't work** (no data to generate PDF from)
3. ❌ **Status not updating** when clients submitted forms
4. ❌ **Data loss** on every deployment

## ✅ Solution Implemented

### Database Schema Updates

Updated `ConsentForm` model to support the full workflow:

```prisma
model ConsentForm {
  // Identity & tracking
  id           String   @id @default(cuid())
  userId       String?
  clientId     String
  clientName   String
  artistEmail  String?
  
  // Form details
  formType     String   // "general-consent", "medical-history", etc.
  token        String   @unique  // Secure access token
  
  // Sending details
  sendMethod   String   @default("email") // "email" or "sms"
  contactInfo  String?  // Email or phone
  customMessage String?
  
  // Status tracking
  status       String   @default("sent") // "sent", "completed", "expired"
  sentAt       DateTime @default(now())
  expiresAt    DateTime
  completedAt  DateTime?
  
  // Form data storage
  formData     Json?    // All submitted form fields
  pdfUrl       String?  // URL to view/download PDF
  
  // Signature & consent
  clientSignature     String?
  clientSignatureDate DateTime?
  
  // Medical information
  medicalHistory      String?
  allergies           String?
  medications         String?
  skinConditions      String?
  previousProcedures  String?
  emergencyContact    String?
  
  // Consent flags
  consentGiven       Boolean @default(true)
  photographyConsent Boolean @default(false)
  marketingConsent   Boolean @default(false)
  
  // Timestamps
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  // Relations
  client     Client   @relation(fields: [clientId], references: [id])
  user       User?    @relation(fields: [userId], references: [id])
  
  // Indexes for performance
  @@index([userId])
  @@index([clientId])
  @@index([token])
  @@index([status])
}
```

### API Endpoints Updated

#### 1. `POST /api/consent-forms` - Create Form
**Before:** Not implemented  
**After:** Creates consent form in database

```typescript
// Usage: When artist sends form to client
POST /api/consent-forms
Headers: { 'x-user-email': 'artist@email.com' }
Body: {
  clientId: "client123",
  clientName: "John Doe",
  formType: "general-consent",
  sendMethod: "email",
  contactInfo: "client@email.com",
  token: "unique-token-123"
}
```

#### 2. `GET /api/consent-forms` - List Forms
**Before:** Retrieved from in-memory Map  
**After:** Queries database with filters

```typescript
// Usage: Load all consent forms for artist
GET /api/consent-forms?status=completed
Headers: { 'x-user-email': 'artist@email.com' }
```

#### 3. `POST /api/consent-forms/[clientId]/[token]` - Submit Form
**Before:** Updated in-memory Map (lost on restart)  
**After:** Updates database record permanently

```typescript
// Usage: When client completes and submits form
POST /api/consent-forms/client123/token456
Body: {
  formData: {
    medicalHistory: "...",
    allergies: "...",
    signature: "data:image/png;base64,..."
  }
}
```

#### 4. `GET /api/consent-forms/[clientId]/[token]/pdf` - View PDF
**Before:** Failed (no data in memory)  
**After:** Generates HTML from database, printable as PDF

```typescript
// Usage: View completed form as PDF
GET /api/consent-forms/client123/token456/pdf
Returns: HTML page with "Print / Save as PDF" button
```

### Component Updates

#### `consent-form-modal.tsx`
**Before:**
- Used PUT to store in memory
- Fell back to localStorage only

**After:**
- Uses POST /api/consent-forms to create in database
- Still uses localStorage as backup
- Proper error handling

### Workflow Now:

```
1. Artist sends consent form
   ↓
2. POST /api/consent-forms creates database record
   ↓
3. Client receives email with link
   ↓
4. Client clicks link → GET /api/consent-forms/[clientId]/[token]
   ↓
5. Client fills form and submits
   ↓
6. POST /api/consent-forms/[clientId]/[token] updates database
   ↓
7. Status → "completed", creates notification
   ↓
8. Artist sees updated status in consent-forms page
   ↓
9. Artist clicks "View PDF" → opens in new tab
   ↓
10. HTML page loads from database with Print button
```

## 🎯 Benefits

✅ **Data Persistence** - Forms never disappear  
✅ **Status Tracking** - Real-time updates when clients submit  
✅ **PDF Viewer Works** - Generates from database data  
✅ **Notifications** - Artist notified when form completed  
✅ **Audit Trail** - All actions logged in database  
✅ **Scalable** - Handles thousands of forms efficiently  
✅ **No Data Loss** - Survives server restarts and deployments  

## 🧪 Testing

To verify the fix works:

1. **Send a consent form to a client**
   - Go to Clients page
   - Click "Send Consent Form"
   - Select form type and send via email

2. **Check database**
   ```bash
   npx prisma studio
   # Navigate to ConsentForm table
   # Should see form with status="sent"
   ```

3. **Client completes form**
   - Client clicks link in email
   - Fills out form and submits
   - Should see success message

4. **Verify completion**
   - Refresh consent-forms page
   - Status should show "Completed" ✅
   - Click "View PDF" should open form

5. **PDF Viewer**
   - Should display form data
   - Has "Print / Save as PDF" button
   - Can be printed from browser

## 📝 Migration Notes

- All NEW consent forms go to database automatically
- OLD forms in localStorage still work (backward compatible)
- System gradually migrates as new forms are created
- No data loss during transition

---

**Fixed:** October 13, 2025  
**Status:** ✅ Deployed to production  
**Impact:** Critical - Prevents data loss and enables proper workflow

