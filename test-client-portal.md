# Client Portal Services Test Guide

## 🔍 **Step-by-Step Troubleshooting**

### **Step 1: Check Browser Console**
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Navigate to the client portal and click "Discover"
4. Look for these console messages:
   - `ContentService: Loaded services from localStorage: [...]`
   - `ContentService: getServices() - All services: [...]`
   - `ContentService: getServices() - Filtered services: [...]`
   - `ServiceShowcase: Loaded services: [...]`

### **Step 2: Test Admin Portal**
1. Go to the admin portal
2. Navigate to "Client Portal Management" → "Services"
3. Try to add a new service
4. Check console for:
   - `Admin: Saving service: [...]`
   - `Admin: Add result: [...]`

### **Step 3: Check localStorage**
1. In browser console, run:
   ```javascript
   console.log('Services:', JSON.parse(localStorage.getItem('pmu_portal_services') || '[]'))
   console.log('Facilities:', JSON.parse(localStorage.getItem('pmu_portal_facilities') || '[]'))
   console.log('Specials:', JSON.parse(localStorage.getItem('pmu_portal_specials') || '[]'))
   ```

### **Step 4: Manual Test**
1. Add a test service in admin portal:
   - Name: "Test Service"
   - Description: "Test Description"
   - Price: 100
   - Category: "Eyebrows"
   - **IMPORTANT**: Don't check "Mark as Special Offer" for this test
2. Save the service
3. Go to client portal → Discover
4. Check if "Test Service" appears

### **Step 5: Debug Special Offers**
If the above doesn't work, try:
1. Add a service with "Mark as Special Offer" checked
2. Set a future end date (e.g., tomorrow's date)
3. Save and check client portal

## 🐛 **Common Issues & Solutions**

### **Issue 1: "No Services Available"**
**Possible Causes:**
- Services not being saved to localStorage
- Services being filtered out by special offer logic
- Services array is empty

**Debug Steps:**
1. Check console logs for service loading
2. Verify localStorage has data
3. Check if services are marked as special with past end dates

### **Issue 2: Services Saved But Not Showing**
**Possible Causes:**
- Filtering logic too restrictive
- Date comparison issues
- Service data structure problems

**Debug Steps:**
1. Check console for filtered vs all services
2. Verify service data structure
3. Test with non-special services first

### **Issue 3: Admin Save Not Working**
**Possible Causes:**
- Form validation issues
- Service creation failing
- localStorage write errors

**Debug Steps:**
1. Check admin console for save logs
2. Verify form data is complete
3. Check for JavaScript errors

## 📋 **Expected Console Output**

### **When Working Correctly:**
```
ContentService: Loaded services from localStorage: [
  {
    id: "service_1234567890",
    name: "Test Service",
    description: "Test Description",
    price: 100,
    category: "Eyebrows",
    isSpecial: false,
    image: "data:image/jpeg;base64,..."
  }
]
ContentService: getServices() - All services: [...]
ContentService: getServices() - Filtered services: [...]
ServiceShowcase: Loaded services: [...]
```

### **When Not Working:**
```
ContentService: No services found in localStorage
ContentService: getServices() - All services: []
ContentService: getServices() - Filtered services: []
ServiceShowcase: Loaded services: []
```

## 🚀 **Quick Fixes**

### **If No Services in localStorage:**
1. Add a service through admin portal
2. Check console for save confirmation
3. Refresh client portal

### **If Services Filtered Out:**
1. Add service without "Mark as Special Offer"
2. Or set future end date for special offers
3. Check filtering logic in console

### **If Still Not Working:**
1. Clear localStorage: `localStorage.clear()`
2. Add fresh test service
3. Check for JavaScript errors

## 📞 **Next Steps**

After following this guide, please share:
1. What console messages you see
2. Whether localStorage has data
3. Any error messages
4. Whether the test service appears

This will help identify the exact issue and provide a targeted fix.


