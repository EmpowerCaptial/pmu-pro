# 📍 Setup Studio Location - Step-by-Step Guide

## 🎯 Purpose

Configure your studio's physical location so students can ONLY clock in when they are actually at your facility (within 50 feet).

---

## 🚨 Why This Is Important

**BEFORE SETUP:**
- Students get error: "Studio location not configured"
- Cannot track hours worked
- Geofencing doesn't work

**AFTER SETUP:**
- Students can clock in ONLY when physically at studio
- Automatic location verification (50-foot radius)
- Accurate hour tracking
- Prevents remote clock-ins

---

## 📋 How to Access (From Dashboard)

### Option 1: From Top Menu (Owners Only)
1. Login as **studio owner** (e.g., tyronejackboy@gmail.com)
2. Click your **profile avatar** (top right)
3. Look for **"Studio Location"** with 📍 icon
4. Click it

### Option 2: Direct URL
```
https://thepmuguide.com/studio/geolocation-settings
```

---

## 🛠️ Setup Instructions

### Step 1: Enter Studio Address
1. In the "Studio Address" field, type your **complete address**:
   ```
   Example: 123 Main Street, Springfield, MO 65802
   ```
2. Click **"Use Current Location"** button (optional)
   - This will auto-fill if you're AT the studio
3. Click **"Geocode Address"** button
4. System will convert address to GPS coordinates

### Step 2: Configure Radius
1. Set the **Clock-In Radius**
   - Default: 100 meters (328 feet)
   - Recommended: 15-50 meters (50-165 feet)
   - Tighter radius = more accurate
2. Use slider or type number

### Step 3: Save Settings
1. Review all information:
   - ✅ Address correct
   - ✅ Latitude/Longitude shown
   - ✅ Radius appropriate
2. Click **"Save Settings"** button
3. Wait for confirmation: "Settings saved successfully!"

### Step 4: Test It
1. While still AT the studio, click **"Test My Location"**
2. Allow browser location access if prompted
3. Should see: ✅ "Within studio radius"
4. If shows distance, verify it's reasonable

---

## 📱 What Students See After Setup

### Before Clock-In:
```
Dashboard → Red Clock Icon (🔴)
   ↓ Click
"Click to clock in"
```

### If AT Studio (Within 50 feet):
```
✅ "Successfully clocked in!"
Icon turns purple (🟣) with pulse
Hours tracking begins
```

### If NOT at Studio (Too far away):
```
❌ "You must be within 50 feet of the studio to clock in.
   You are currently 543 feet away."
Icon stays red
Cannot clock in
```

---

## 🔧 Technical Details

### How Geofencing Works:

1. **Student clicks clock-in button**
2. **Browser requests location** (GPS)
3. **System calculates distance** using Haversine formula:
   ```
   Distance = Earth radius × arc distance
   Between: (Student Lat/Lng) ↔ (Studio Lat/Lng)
   ```
4. **If distance ≤ radius:** ✅ Allow clock-in
5. **If distance > radius:** ❌ Block with error message

### Accuracy:
- GPS accuracy: ±5-15 meters outdoors
- WiFi/cell accuracy: ±20-50 meters indoors
- Recommended radius: 50+ meters to account for GPS drift
- Browser must have location permission

### Security:
- Cannot be spoofed easily (GPS is hardware-based)
- Location checked every 15 minutes while clocked in
- Auto clock-out if student leaves radius
- All location data stored securely

---

## 🎓 For Studio Owners

### Current Status Check:
```bash
# Check if studio location is configured
Visit: /studio/geolocation-settings

If you see:
  "Studio location not configured" ❌
  → Need to set it up now

If you see:
  Address, Lat/Lng, Radius ✅
  → Already configured!
```

### Updating Location:
- Change address anytime
- Re-geocode to update coordinates
- Adjust radius as needed
- Click "Save Settings"

### Multiple Locations:
Currently supports ONE studio location per account.
For multi-site studios:
- Use central location
- Increase radius to cover all sites
- OR create separate owner accounts per location

---

##  Common Issues & Solutions

### Issue 1: "Geolocation not supported"
**Solution:** Use modern browser (Chrome, Safari, Edge, Firefox)

### Issue 2: "Location permission denied"
**Solution:** 
1. Browser settings → Privacy & Security
2. Find Location permissions
3. Allow for thepmuguide.com

### Issue 3: "You are X feet away" but I'm at studio
**Possible causes:**
- GPS drift (increase radius)
- Wrong address configured (check settings)
- Indoor location less accurate (use WiFi)

**Solution:**
- Increase radius to 100-150 meters
- Verify studio address is correct
- Test from different areas of building

### Issue 4: Students clock in from home
**Check:**
- Is studio location configured? (not using NYC defaults)
- Is radius too large? (should be 15-100 meters)
- Are coordinates correct? (verify address)

---

## 📊 Example Setup (Universal Beauty Studio Academy)

```
Studio Address: 
  [Your actual street address]
  [City], [State] [Zip]

After Geocoding:
  Latitude: XX.XXXXX
  Longitude: -XX.XXXXX
  
Radius: 50 meters (165 feet)
  
Status: ✅ Configured
  
Students can now:
  ✓ Clock in when at studio
  ✓ Track hours worked
  ✓ Automatic location verification
```

---

## 🚀 Quick Start (2 Minutes)

1. **Login as owner** → tyronejackboy@gmail.com
2. **Click profile avatar** → "Studio Location"
3. **Enter address** → Your studio street address
4. **Click "Geocode Address"**
5. **Set radius** → 50 meters
6. **Click "Save Settings"**
7. **Done!** Students can now clock in

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Studio address shows correctly
- [ ] Latitude/Longitude populated (not null)
- [ ] Radius set (default 100m is fine)
- [ ] "Test My Location" works when at studio
- [ ] Jenny can clock in (test with her account)
- [ ] Clock icon turns red → purple when clocked in
- [ ] Distance shown if trying to clock in from far away

---

## 📞 Support

**If location setup isn't working:**

1. Check browser console for errors
2. Verify address is exact (including zip code)
3. Try "Use Current Location" while AT studio
4. Clear browser cache and try again
5. Test in incognito mode
6. Ensure HTTPS (not HTTP)

**System Requirements:**
- HTTPS connection (✅ thepmuguide.com uses HTTPS)
- Modern browser with geolocation API
- Location permission granted
- Internet connection for geocoding

---

## 🎬 Summary

**Status:** Geolocation system is ACTIVE and enforced

**What Changed:**
- ❌ OLD: Students could clock in without location (bug)
- ✅ NEW: Students MUST be at studio to clock in

**Next Steps:**
1. Owner: Configure studio location (5 minutes)
2. Students: Can then clock in when at facility
3. System: Automatically tracks and verifies hours

**Live:** https://thepmuguide.com/studio/geolocation-settings

---

**Date Created:** October 13, 2025  
**System:** PMU Guide - Studio Management Platform  
**Feature:** Geofencing & Time Tracking for Students

