# Wix Webhook Integration Guide

This guide explains how to connect your Wix Studio form submissions to the PMU Pro CRM system.

## 📋 Overview

When someone submits a form on your Wix site, the webhook will automatically create a contact in your CRM with the information provided.

## 🔗 Webhook Endpoint

**URL:** `https://thepmuguide.com/api/webhooks/wix`  
**Method:** `POST`  
**Content-Type:** `application/json`

## 🔐 Authentication

The webhook uses a secret token for security. You'll need to set this up in both:
1. Your PMU Pro environment variables
2. Your Wix automation settings

### Setting Up the Secret

1. **Generate a secure secret** (use a long random string):
   ```bash
   # Example: Generate a random secret
   openssl rand -hex 32
   ```

2. **Add to your environment variables:**
   - In Vercel: Go to your project → Settings → Environment Variables
   - Add: `WEBHOOK_SECRET` or `WIX_WEBHOOK_SECRET` with your generated secret
   - Redeploy your application

3. **Use in Wix:** Include this secret in the Authorization header (see below)

## 📤 Request Format

### Headers

```
Authorization: Bearer YOUR_WEBHOOK_SECRET
Content-Type: application/json
```

**OR** use a custom header:

```
x-webhook-secret: YOUR_WEBHOOK_SECRET
Content-Type: application/json
```

### Body Parameters

#### Required Fields:
- `firstName` (string) - Contact's first name
- `lastName` (string) - Contact's last name
- **Either** `email` (string) **OR** `phone` (string) - At least one contact method required

#### Optional Fields:
- `email` (string) - Contact's email address
- `phone` (string) - Contact's phone number
- `source` (string) - Lead source (defaults to "Wix" if not provided)
- `tags` (string[]) - Array of tags to add to the contact (automatically includes "Wix")
- `ownerEmail` (string) - Email of staff member to assign this contact to
- `notes` (string) - Additional notes about the contact

### Example Request Body

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1-555-123-4567",
  "source": "Wix Contact Form",
  "tags": ["New Lead", "Interested in Microblading"],
  "ownerEmail": "owner@yourstudio.com",
  "notes": "Interested in booking a consultation for next month"
}
```

### Minimal Example (Only Required Fields)

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```

## 📥 Response Format

### Success Response (200)

```json
{
  "success": true,
  "contact": {
    "id": "clx1234567890",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1-555-123-4567",
    "source": "Wix",
    "tags": ["Wix", "New Lead", "Interested in Microblading"],
    "stage": "LEAD"
  }
}
```

### Error Responses

#### 400 - Bad Request (Missing Required Fields)
```json
{
  "error": "First name and last name are required"
}
```

#### 400 - Missing Contact Method
```json
{
  "error": "Either email or phone number is required to create a contact"
}
```

#### 401 - Unauthorized (Invalid Secret)
```json
{
  "error": "Unauthorized - Invalid webhook secret"
}
```

#### 409 - Duplicate Contact
```json
{
  "error": "A contact with this email already exists: Jane Smith",
  "code": "duplicate_contact",
  "existingContactId": "clx1234567890"
}
```

#### 500 - Server Error
```json
{
  "error": "Failed to create contact"
}
```

## 🎯 Setting Up in Wix

### Step 1: Create a Wix Automation

1. Go to your Wix dashboard
2. Navigate to **Automations** → **Create Automation**
3. Select **Form Submission** as the trigger
4. Choose the form you want to connect

### Step 2: Add HTTP Request Action

1. Add an action: **Send HTTP Request**
2. Configure the request:
   - **Method:** `POST`
   - **URL:** `https://thepmuguide.com/api/webhooks/wix`
   - **Headers:**
     - `Authorization`: `Bearer YOUR_WEBHOOK_SECRET`
     - `Content-Type`: `application/json`

### Step 3: Map Form Fields to Request Body

In the request body, map your form fields:

```json
{
  "firstName": "{{form.firstName}}",
  "lastName": "{{form.lastName}}",
  "email": "{{form.email}}",
  "phone": "{{form.phone}}",
  "source": "Wix Contact Form",
  "notes": "{{form.message}}"
}
```

**Note:** Replace `{{form.fieldName}}` with the actual field names from your Wix form.

### Step 4: Test the Automation

1. Submit a test form on your Wix site
2. Check the automation logs in Wix
3. Verify the contact appears in your PMU Pro CRM at `/crm`

## 🔍 Contact Assignment

### Automatic Assignment

If you don't specify an `ownerEmail`:
- The system will automatically assign the contact to the first available owner, manager, or director in your CRM

### Manual Assignment

To assign contacts to a specific staff member:
- Include `ownerEmail` in the request body with the staff member's email address
- The system will find or create a staff record for that email

## 🏷️ Tags and Source

- All contacts created via this webhook automatically get the tag `"Wix"`
- The `source` field defaults to `"Wix"` if not specified
- Additional tags can be included in the `tags` array
- Contacts are created with stage `"LEAD"` by default

## 🔄 Duplicate Handling

The webhook checks for duplicates:
- **By email:** If a contact with the same email exists, returns a 409 error
- **By phone:** If no email is provided, checks for duplicate phone numbers

If a duplicate is found, the response includes:
- The existing contact's ID
- The existing contact's name
- An error code: `duplicate_contact`

You can use this information in Wix to update the existing contact instead of creating a new one.

## 🛠️ Troubleshooting

### Contact Not Appearing in CRM

1. **Check the webhook secret:**
   - Verify it matches in both Wix and your environment variables
   - Ensure you've redeployed after adding the environment variable

2. **Check Wix automation logs:**
   - Look for error responses
   - Verify the request format matches the examples above

3. **Check PMU Pro logs:**
   - In Vercel, check function logs for errors
   - Look for database connection issues

### Authentication Errors

- Ensure the `Authorization` header uses `Bearer ` prefix
- Verify the secret is exactly the same in both places (no extra spaces)
- Try using the `x-webhook-secret` header as an alternative

### Missing Fields Error

- Ensure `firstName` and `lastName` are always provided
- At least one of `email` or `phone` must be provided
- Check that your Wix form field names match the JSON keys

## 📝 Example Wix Automation Configuration

Here's a complete example of how to set up the automation in Wix:

**Trigger:** Form Submission  
**Action:** Send HTTP Request

**Request Configuration:**
- Method: POST
- URL: `https://thepmuguide.com/api/webhooks/wix`
- Headers:
  ```
  Authorization: Bearer your-secret-here
  Content-Type: application/json
  ```
- Body:
  ```json
  {
    "firstName": "{{form.firstName}}",
    "lastName": "{{form.lastName}}",
    "email": "{{form.email}}",
    "phone": "{{form.phone}}",
    "source": "Wix Website Contact Form",
    "notes": "{{form.message}}"
  }
  ```

## 🔒 Security Best Practices

1. **Use a strong secret:** Generate a long, random string (at least 32 characters)
2. **Keep it secret:** Never commit the secret to version control
3. **Rotate regularly:** Change the secret periodically
4. **Monitor logs:** Regularly check for unauthorized access attempts
5. **Use HTTPS:** Always use `https://` in the webhook URL

## 📞 Support

If you encounter issues:
1. Check the error response from the webhook
2. Review the troubleshooting section above
3. Check your Vercel function logs
4. Verify your database connection and CRM tables are set up correctly


