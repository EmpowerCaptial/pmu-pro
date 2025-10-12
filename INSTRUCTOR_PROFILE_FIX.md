# Instructor Profile Studio Name Protection

## Problem

When instructors, students, or licensed artists edited their profile on the profile page, they had the ability to modify their `studioName` field. This is a **critical issue** because:

1. The services API (`/api/services/route.ts`) matches studio members to owners by comparing `studioName`
2. If an instructor changes their `studioName`, they lose access to their owner's service list
3. The connection between the instructor and studio owner is broken

## Root Cause

The profile page allowed all users to edit both `businessName` and `studioName` fields without restrictions based on user role.

## Solution Implemented

### 1. Frontend Protection (`app/profile/page.tsx`)

- Made the `studioName` field **read-only** for instructors, students, and licensed artists
- Added visual indication (amber warning text) explaining why the field cannot be changed
- Added helper text for both fields:
  - **businessName**: "Your personal or business branding name" (editable)
  - **studioName**: "Studio name is managed by your studio owner and cannot be changed" (read-only for members)
  - For owners: "The studio your team members will be linked to" (editable)

```typescript
disabled={!isEditing || ['instructor', 'student', 'licensed'].includes(currentUser?.role || '')}
```

### 2. Backend API Protection (`app/api/profile/route.ts`)

- Added role-based validation to prevent studio members from changing `studioName`
- Returns a `403 Forbidden` response if a studio member tries to modify `studioName`
- Automatically removes `studioName` from update data for studio members
- Still allows these users to update their personal `businessName` for branding purposes

### 3. Library-Level Protection (`lib/auth.ts`)

- Updated `AuthService.updateProfile()` to automatically strip `studioName` from updates for studio members
- This protects against any code that uses this utility method directly
- Ensures consistency across the entire application

## Why BusinessName is Still Editable

The `businessName` field can safely be edited by instructors because:
- It's used for personal/business branding only
- It does NOT affect service assignment or studio relationships
- Only `studioName` is used to match members with their owner's services

## Testing Checklist

To verify the fix works:

1. ✅ Log in as an instructor (e.g., Jenny - jenny@test.com)
2. ✅ Navigate to Profile page
3. ✅ Click "Edit Profile"
4. ✅ Verify `studioName` field is grayed out and cannot be edited
5. ✅ Verify amber warning text appears under `studioName`
6. ✅ Verify `businessName` CAN still be edited
7. ✅ Try to save with modified `businessName` - should succeed
8. ✅ Verify you can still access owner's services after save

For Owner Testing:
1. ✅ Log in as owner (e.g., Tyrone)
2. ✅ Navigate to Profile page
3. ✅ Verify BOTH `studioName` and `businessName` can be edited
4. ✅ Verify helper text shows "The studio your team members will be linked to"

## Technical Details

### Service Assignment Logic
The services API uses this logic to find the correct studio owner:

```typescript
if (user.studioName && (user.role === 'student' || user.role === 'licensed' || user.role === 'instructor')) {
  // Find owner with matching studioName
  let studioOwner = await prisma.user.findFirst({
    where: { 
      studioName: user.studioName,  // ← Critical match point
      role: 'owner'
    }
  })
  
  // Get services from that owner
  services = await prisma.service.findMany({
    where: { userId: studioOwner.id }
  })
}
```

If `studioName` doesn't match, no owner is found, and the member sees no services.

## Related Files Modified

1. `app/profile/page.tsx` - Frontend UI restrictions
2. `app/api/profile/route.ts` - API-level validation
3. `lib/auth.ts` - Utility method protection

## Future Considerations

- Consider adding a "Request Studio Name Change" workflow if legitimate changes are needed
- Monitor for edge cases where studio members need to transfer between studios
- Add admin tools to safely reassign studio members if needed

