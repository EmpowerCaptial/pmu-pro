# 🚀 SYNTAX ERROR FIX - READY TO PASTE

## 🎯 **THE ISSUE:**
Lines 130 and 133 in `lib/client-portal-content-service.ts` have broken statements:
- `error?.message` (incomplete statement)
- `error?.name` (incomplete statement)

## 📋 **GITHUB LINK:**
https://github.com/EmpowerCaptial/pmu-pro/edit/main/lib/client-portal-content-service.ts

## 🔧 **FIND AND REPLACE:**

**Find this (around lines 128-134):**
```typescript
} catch (error: any) {
  console.error('Error saving portal content:', error)
  error?.message
  
  // If it's a quota exceeded error, try to compress images
  error?.name
    console.warn('ContentService: localStorage quota exceeded, attempting to compress images')
```

**Replace with:**
```typescript
} catch (error: any) {
  console.error('Error saving portal content:', error)
  console.error('Error details:', error?.message)
  
  // If it's a quota exceeded error, try to compress images
  if (error?.name === 'QuotaExceededError') {
    console.warn('ContentService: localStorage quota exceeded, attempting to compress images')
```

## ✅ **RESULT:**
This fixes the syntax errors and the build should succeed!

**The token had permission issues, but the fix is ready to paste!** 🎯
