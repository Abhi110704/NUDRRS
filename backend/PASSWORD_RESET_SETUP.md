# Password Reset Setup Guide

## Overview
The password reset functionality has been implemented with OTP-based email verification. Users can reset their passwords by receiving a 6-digit OTP via email.

## Features
- **3-Step Process**: Email → OTP Verification → New Password
- **Secure OTP**: 6-digit code valid for 15 minutes
- **Email Templates**: Beautiful HTML email templates with NUDRRS branding
- **Rate Limiting**: Built-in protection against brute force attacks
- **Auto Cleanup**: Expired tokens are automatically cleaned up

## Backend API Endpoints

### 1. Request Password Reset
```
POST /api/auth/password-reset-request/
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "OTP sent to your email address",
  "email": "user@example.com",
  "expires_at": "2024-01-15T10:30:00Z"
}
```

### 2. Verify OTP
```
POST /api/auth/password-reset-verify-otp/
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "email": "user@example.com",
  "verified_at": "2024-01-15T10:25:00Z"
}
```

### 3. Confirm Password Reset
```
POST /api/auth/password-reset-confirm/
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "newSecurePassword123",
  "new_password2": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

## Email Configuration

### Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Add to your `.env` file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-character-app-password
DEFAULT_FROM_EMAIL=noreply@nudrrs.com
```

### Other Email Providers
- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Use your provider's SMTP settings

## Frontend Integration

### Password Reset Component
The `PasswordReset.js` component provides a complete 3-step flow:

1. **Step 1**: Email input with validation
2. **Step 2**: OTP verification with resend functionality
3. **Step 3**: New password setting with confirmation

### Navigation
- Added "Forgot your password?" link to the login page
- Route: `/password-reset`
- Accessible without authentication

## Database Schema

### MongoDB Collections

#### `password_reset_tokens`
```javascript
{
  _id: ObjectId,
  email: String,
  otp: String,
  user_id: String,
  created_at: Date,
  expires_at: Date,
  is_used: Boolean,
  attempts: Number,
  verified_at: Date,
  completed_at: Date
}
```

## Security Features

1. **OTP Expiration**: 15-minute validity
2. **Single Use**: OTPs can only be used once
3. **Attempt Tracking**: Failed attempts are logged
4. **Email Validation**: Only registered emails can request reset
5. **Password Validation**: Django's built-in password validators
6. **Token Cleanup**: Expired tokens are automatically removed

## Testing

### Manual Testing
1. Register a new user
2. Go to login page
3. Click "Forgot your password?"
4. Enter email address
5. Check email for OTP
6. Enter OTP and verify
7. Set new password
8. Login with new password

### API Testing with cURL

```bash
# Request OTP
curl -X POST http://localhost:8000/api/auth/password-reset-request/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Verify OTP
curl -X POST http://localhost:8000/api/auth/password-reset-verify-otp/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'

# Reset Password
curl -X POST http://localhost:8000/api/auth/password-reset-confirm/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456", "new_password": "newpass123", "new_password2": "newpass123"}'
```

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check email configuration in `.env`
   - Verify SMTP credentials
   - Check firewall/network restrictions

2. **OTP not received**
   - Check spam folder
   - Verify email address is correct
   - Check email server logs

3. **Invalid OTP error**
   - OTP expires in 15 minutes
   - OTP can only be used once
   - Check for typos in OTP entry

4. **User not found error**
   - Email must be registered in the system
   - Check email address spelling

### Logs
Check Django logs for detailed error messages:
```bash
tail -f backend/server.log
```

## Production Considerations

1. **Email Service**: Consider using SendGrid, AWS SES, or similar for production
2. **Rate Limiting**: Implement additional rate limiting for production
3. **Monitoring**: Set up monitoring for failed password reset attempts
4. **Backup**: Ensure email delivery has fallback mechanisms
5. **Security**: Use HTTPS in production for all API calls

## Future Enhancements

1. **SMS OTP**: Add SMS as alternative to email
2. **Security Questions**: Add security questions as backup
3. **Account Lockout**: Implement account lockout after multiple failed attempts
4. **Audit Logging**: Enhanced logging for security auditing
5. **Multi-language**: Support for multiple languages in emails
