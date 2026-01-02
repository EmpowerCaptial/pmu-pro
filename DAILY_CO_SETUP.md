# Daily.co Live Streaming Setup Guide

## Overview
This application uses Daily.co for integrated live video streaming. Instructors can start live sessions directly in the app, and students can join to watch, participate, and chat in real-time.

## Setup Instructions

### 1. Create a Daily.co Account
1. Go to https://www.daily.co/
2. Sign up for a free account
3. Navigate to the Dashboard

### 2. Get Your API Key
1. In the Daily.co dashboard, go to **Developers** → **API Keys**
2. Create a new API key or copy your existing one
3. The API key will look like: `abc123def456ghi789...`

### 3. Add API Key to Environment Variables

#### For Local Development:
Add to your `.env.local` file:
```bash
DAILY_API_KEY=your_daily_co_api_key_here
```

#### For Production (Vercel):
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `DAILY_API_KEY`
   - **Value**: Your Daily.co API key
   - **Environment**: Production, Preview, Development
4. Redeploy your application

### 4. Test the Integration
1. Log in as an instructor
2. Go to the Training/Fundamentals page
3. Click "Go Live" in the Quick Actions banner
4. Enter a session title and description
5. Click "Go Live" to create and join the session
6. Students can then see and join the live stream from their portal

## Features

### For Instructors:
- **Go Live**: Start a new live streaming session
- **Video & Audio**: Share camera and microphone
- **Participant List**: See all students who joined
- **Chat**: Communicate with students via text chat
- **Controls**: Mute/unmute camera and microphone

### For Students:
- **Join Live Stream**: See active sessions and join
- **Watch & Participate**: Turn on camera/mic to participate
- **Chat**: Send messages during the session
- **Participant List**: See who else is in the session

## Daily.co Pricing

### Free Tier:
- 2,000 participant-minutes per month
- Up to 50 participants per room
- Basic features included

### Paid Plans:
- Pay-as-you-go: $0.0025 per participant-minute after free tier
- Pro plans available for higher usage

## Troubleshooting

### "Daily.co API key not configured" Error
- Make sure `DAILY_API_KEY` is set in your environment variables
- Restart your development server after adding the key
- Check that the key is correct (no extra spaces or quotes)

### Video/Audio Not Working
- Check browser permissions for camera and microphone
- Ensure HTTPS is used (required for media access)
- Try a different browser if issues persist

### Students Can't See the Stream
- Verify the instructor has started the session
- Check that the room was created successfully
- Ensure students are clicking "Join Live Stream" on an active room

## Support

For Daily.co specific issues:
- Daily.co Documentation: https://docs.daily.co/
- Daily.co Support: support@daily.co

For application issues:
- Check the browser console for errors
- Verify all environment variables are set correctly
- Ensure you're using the latest version of the application

