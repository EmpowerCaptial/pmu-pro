# PMU Pro Database Schema

## 🗄️ Overview

The PMU Pro database schema has been enhanced to support comprehensive client management, document storage, and procedure tracking for permanent makeup professionals.

## 📊 Database Tables

### 1. **Users** (Existing)
- **Purpose**: Store PMU professional accounts
- **Key Fields**: 
  - `id`, `email`, `name`, `role`
  - `isLicenseVerified`, `hasActiveSubscription`
  - `stripeCustomerId`, `subscriptionStatus`

### 2. **Clients** (Enhanced)
- **Purpose**: Store client information and medical history
- **Key Fields**:
  - **Basic Info**: `name`, `email`, `phone`
  - **Medical**: `dateOfBirth`, `emergencyContact`, `medicalHistory`, `allergies`
  - **PMU Specific**: `skinType` (Fitzpatrick scale)
  - **Status**: `isActive`, `notes`
  - **Timestamps**: `createdAt`, `updatedAt`

### 3. **Documents** (New)
- **Purpose**: Store all client-related documents and files
- **Key Fields**:
  - **File Info**: `fileUrl`, `filename`, `fileSize`, `mimeType`
  - **Classification**: `type` (enum with predefined document types)
  - **Metadata**: `notes`, `createdAt`, `updatedAt`
  - **Relations**: `clientId` → links to specific client

#### Document Types
```typescript
enum DocumentType {
  ID_DOCUMENT        // Government ID, driver's license
  CONSENT_FORM       // Procedure consent forms
  WAIVER            // Liability waivers
  INTAKE_FORM       // Client intake questionnaires
  CONTRAINDICATION_FORM // Medical contraindication forms
  ANALYSIS_REPORT   // Skin analysis results
  PHOTO            // Client photos (before/after)
  OTHER            // Miscellaneous documents
}
```

### 4. **Procedures** (New)
- **Purpose**: Track all PMU procedures performed on clients
- **Key Fields**:
  - **Procedure Details**: `procedureType`, `areaTreated`, `duration`
  - **Technical Specs**: `voltage`, `needleConfiguration`, `depth`
  - **Pigment Info**: `pigmentBrand`, `pigmentColor`, `lotNumber`
  - **Scheduling**: `procedureDate`, `followUpDate`
  - **Status**: `isCompleted`, `notes`

#### Procedure Types Examples
- Microblading
- Powder Brows
- Combination Brows
- Eyeliner (top, bottom, or both)
- Lip Color/Contour
- Beauty Marks
- Scalp Micropigmentation

### 5. **Existing Tables** (Maintained)
- **Photos**: Client photos with metadata
- **Intakes**: Medical intake forms
- **Analyses**: Skin analysis results
- **Pigments**: Pigment library
- **MagicLinkToken**: Authentication tokens

## 🔗 Relationships

```
User (1) ←→ (Many) Clients
Client (1) ←→ (Many) Documents
Client (1) ←→ (Many) Procedures
Client (1) ←→ (Many) Photos
Client (1) ←→ (Many) Intakes
Client (1) ←→ (Many) Analyses
```

## 📝 Sample Data Structure

### Client Record
```json
{
  "id": "client_123",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15T00:00:00Z",
  "emergencyContact": "John Doe +1234567891",
  "medicalHistory": "No known medical conditions",
  "allergies": "None reported",
  "skinType": "Type III",
  "isActive": true,
  "notes": "Prefers natural-looking brows"
}
```

### Document Record
```json
{
  "id": "doc_456",
  "clientId": "client_123",
  "type": "CONSENT_FORM",
  "fileUrl": "/uploads/consent-forms/consent_123.pdf",
  "filename": "Consent_Form_Jane_Doe.pdf",
  "fileSize": 245760,
  "mimeType": "application/pdf",
  "notes": "Signed consent form for microblading procedure"
}
```

### Procedure Record
```json
{
  "id": "proc_789",
  "clientId": "client_123",
  "procedureType": "Microblading",
  "voltage": 7.5,
  "needleConfiguration": "18 needles, 0.18mm",
  "pigmentBrand": "Permablend",
  "pigmentColor": "Medium Brown",
  "lotNumber": "MB-2024-001",
  "depth": "0.2-0.3mm",
  "duration": 120,
  "areaTreated": "Eyebrows",
  "procedureDate": "2024-08-19T10:00:00Z",
  "followUpDate": "2024-09-19T10:00:00Z",
  "isCompleted": true,
  "notes": "Client tolerated procedure well"
}
```

## 🚀 Implementation Steps

### 1. **Update Database Schema**
```bash
# Generate Prisma client with new schema
npx prisma generate

# Push schema changes to database
npx prisma db push
```

### 2. **Run Migration Script**
```bash
# Update existing data and create sample records
npx tsx scripts/update-database-schema.ts
```

### 3. **Verify Schema**
```bash
# Check database status
npx prisma studio
```

## 🔒 Data Security & Privacy

### **HIPAA Compliance Considerations**
- **Client Medical Data**: Store securely with encryption
- **Document Access**: Implement role-based access control
- **Audit Trail**: Track all data access and modifications
- **Data Retention**: Implement data retention policies

### **Recommended Security Measures**
- Encrypt sensitive client data at rest
- Implement proper authentication and authorization
- Regular security audits and penetration testing
- Compliance with local healthcare data regulations

## 📱 Frontend Integration

### **Client Management**
- Client profile pages with medical history
- Document upload and management interface
- Procedure scheduling and tracking
- Photo gallery (before/after)

### **Document Management**
- Drag-and-drop file uploads
- Document type categorization
- Search and filter capabilities
- Version control for updated documents

### **Procedure Tracking**
- Procedure forms with all required fields
- Pigment inventory integration
- Follow-up scheduling
- Progress tracking and completion status

## 🔄 Future Enhancements

### **Planned Features**
- **Appointment Scheduling**: Integration with calendar systems
- **Inventory Management**: Track pigment and supply usage
- **Reporting**: Generate client and business reports
- **Mobile App**: Native mobile application for field work
- **API Integration**: Connect with other PMU software

### **Data Analytics**
- Client retention metrics
- Procedure success rates
- Revenue tracking by procedure type
- Popular pigment and technique analysis

## 🛠️ Development Notes

### **Database Migrations**
- All new fields are optional to maintain backward compatibility
- Existing data will be preserved during schema updates
- Sample data creation for testing and demonstration

### **Performance Considerations**
- Index on frequently queried fields (`clientId`, `type`, `procedureDate`)
- Pagination for large document and procedure lists
- Efficient file storage and retrieval strategies

---

**Schema Version**: 2.0  
**Last Updated**: August 19, 2024  
**Compatibility**: Backward compatible with existing data
