# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (choose the free M0 tier)

## Step 2: Get Your Connection String
1. In your Atlas dashboard, click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Python" and version "3.6 or later"
4. Copy the connection string (it will look like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/
   ```

## Step 3: Configure Environment Variables
Create a `.env` file in the backend directory with:

```bash
# MongoDB Atlas Configuration
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/


# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Optional API Keys
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

## Step 4: Update Your Connection String
Replace the placeholders in your `.env` file:
- `username`: Your MongoDB Atlas username
- `password`: Your MongoDB Atlas password
- `cluster`: Your cluster name from Atlas

## Step 5: Configure Network Access
1. In Atlas dashboard, go to "Network Access"
2. Add your IP address or use `0.0.0.0/0` for all IPs (less secure)
3. For development, you can allow all IPs

## Step 6: Create Database User
1. In Atlas dashboard, go to "Database Access"
2. Click "Add New Database User"
3. Create a user with read/write permissions
4. Use these credentials in your connection string

## Example Connection String
```
mongodb+srv://nudrrs_user:your_password@nudrrs-cluster.abc123.mongodb.net/
```

## Testing the Connection
After setting up, restart your Django server and test:
```bash
curl -H "Authorization: Token YOUR_TOKEN" http://localhost:8000/api/mongodb/status/
```

## Security Notes
- Never commit your `.env` file to version control
- Use strong passwords for your database users
- Restrict network access to specific IPs in production
- Consider using MongoDB Atlas's built-in security features
