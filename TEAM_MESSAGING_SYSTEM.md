# Team Messaging System

## Overview

The Team Messaging System allows studio members (owners, instructors, licensed artists, and students) to communicate with each other within the platform. This provides internal communication without needing external tools.

## Features

### ✅ Recipient Selector
- **Select who to send to**: Dropdown list showing all team members in your studio
- **Visual indicators**: Shows role badges (Owner, Instructor, Licensed, Student) and avatars
- **Smart filtering**: Only shows studio members (excludes yourself)

### ✅ Message Composition
- **Subject line**: Optional subject for organizing messages
- **Message body**: Full-featured textarea for detailed messages
- **Character counter**: Shows message length as you type

### ✅ Inbox & Sent Views
- **Inbox**: See all messages sent to you
- **Sent**: Review messages you've sent to others
- **Unread badges**: Visual indicators for new messages
- **Read receipts**: See when messages have been read

### ✅ Real-time Updates
- **Unread count**: Badge in navigation shows number of unread messages
- **Auto-refresh**: Updates every 30 seconds
- **Instant marking**: Mark messages as read with one click

## User Interface

### Navigation
Access team messages from the top navigation menu:
- Click your avatar
- Select "Team Messages" from dropdown
- Badge shows unread count (if any)

### Compose Message
1. Click "New Message" button
2. Select recipient from dropdown
3. Add optional subject
4. Type your message
5. Click "Send Message"

### Reading Messages
- **Unread messages**: Highlighted with lavender background
- **Mark as read**: Click "Mark Read" button
- **View details**: See sender info, timestamp, and read status

## Database Schema

```prisma
model TeamMessage {
  id          String   @id @default(cuid())
  senderId    String   // User who sent the message
  recipientId String   // User who receives the message
  subject     String?
  message     String   // Message content
  isRead      Boolean  @default(false)
  readAt      DateTime?
  createdAt   DateTime @default(now())
  
  sender      User     @relation("SentMessages")
  recipient   User     @relation("ReceivedMessages")
}
```

## API Endpoints

### GET `/api/team-messages`
Get all messages for current user (inbox + sent)

**Headers:**
- `x-user-email`: User's email address

**Response:**
```json
{
  "sentMessages": [...],
  "receivedMessages": [...],
  "unreadCount": 3
}
```

### POST `/api/team-messages`
Send a new message

**Headers:**
- `x-user-email`: Sender's email address
- `Content-Type`: application/json

**Body:**
```json
{
  "recipientId": "user-id",
  "subject": "Optional subject",
  "message": "Message content"
}
```

### PUT `/api/team-messages`
Mark message as read

**Headers:**
- `x-user-email`: User's email address
- `Content-Type`: application/json

**Body:**
```json
{
  "messageId": "message-id"
}
```

### GET `/api/team-messages/recipients`
Get list of team members user can message

**Headers:**
- `x-user-email`: User's email address

**Response:**
```json
{
  "recipients": [
    {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "...",
      "role": "instructor"
    }
  ]
}
```

## Security & Permissions

### Studio Verification
- Users can only message members of their own studio
- Verified by matching `studioName` field
- Owners can message any studio member

### Message Privacy
- Only sender and recipient can see the message
- No cross-studio messaging
- Messages are deleted when users are removed from studio (CASCADE delete)

## Usage Examples

### For Owners
- Send announcements to team members
- Request updates from instructors
- Communicate schedule changes
- Share important studio information

### For Instructors
- Report to owner about students
- Ask questions about procedures
- Share client feedback
- Coordinate with other instructors

### For Students
- Ask instructors questions
- Request guidance from owner
- Report issues or concerns
- Share progress updates

## Migration Required

After deploying, run:

```bash
npx prisma migrate dev --name add_team_messaging

npx prisma generate
```

## Files Created/Modified

### New Files
- `app/team-messages/page.tsx` - Main messaging interface
- `app/api/team-messages/route.ts` - Main API endpoints
- `app/api/team-messages/recipients/route.ts` - Get recipients endpoint

### Modified Files
- `prisma/schema.prisma` - Added TeamMessage model
- `components/ui/navbar.tsx` - Added messaging link with unread count

## Future Enhancements

### Planned Features
1. **Group messaging**: Send to multiple recipients
2. **Message threads**: Reply to specific messages
3. **Attachments**: Share files with messages
4. **Message search**: Find messages by keyword
5. **Message archiving**: Archive old conversations
6. **Push notifications**: Real-time alerts for new messages
7. **Email notifications**: Option to receive messages via email
8. **Read status**: See when messages are delivered/read
9. **Message templates**: Save frequently sent messages
10. **Priority marking**: Flag urgent messages

### Integration Opportunities
- Link to appointments (message about specific appointment)
- Link to clients (discuss client with team)
- Link to services (ask questions about procedures)

## Best Practices

### For Users
- Use clear, descriptive subjects
- Keep messages professional
- Respond promptly to urgent messages
- Mark messages as read after viewing

### For Administrators
- Set guidelines for message usage
- Monitor message volume
- Address conflicts professionally
- Archive important messages

## Troubleshooting

### Messages not showing
- Verify user is in correct studio
- Check `studioName` matches
- Ensure database migration completed

### Unread count not updating
- Check NavBar component loaded
- Verify API endpoint accessible
- Clear browser cache

### Can't send to team member
- Confirm recipient is in same studio
- Verify recipient account is active
- Check user permissions

## Related Documentation

- `STAFF_MANAGEMENT_SYSTEM.md` - Studio team structure
- `DATABASE_SCHEMA.md` - Complete database schema
- `INSTRUCTOR_PROFILE_FIX.md` - Studio name protection

## Support

For technical issues:
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Confirm database migration completed
4. Review user's studio assignment

