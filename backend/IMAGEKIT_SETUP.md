 # ImageKit Setup Guide

## Step 1: Create ImageKit Account
1. Go to [ImageKit.io](https://imagekit.io)
2. Sign up for a free account
3. Create a new project

## Step 2: Get Your Credentials
1. In your ImageKit dashboard, go to "Developer Options"
2. Copy the following credentials:
   - **Public Key**: Your public API key
   - **Private Key**: Your private API key  
   - **URL Endpoint**: Your ImageKit URL endpoint

## Step 3: Configure Environment Variables
Add these to your `.env` file:

```bash
# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id/
```

## Step 4: Example Credentials Format
```bash
IMAGEKIT_PUBLIC_KEY=public_abc123def456ghi789
IMAGEKIT_PRIVATE_KEY=private_xyz789uvw456rst123
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id/
```

## Step 5: Test the Connection
After setting up, restart your Django server and test:
```bash
curl -H "Authorization: Token YOUR_TOKEN" http://localhost:8000/api/imagekit/status/
```

## API Endpoints Available

### Upload Image (Multipart)
```bash
curl -X POST \
  -H "Authorization: Token YOUR_TOKEN" \
  -F "file=@image.jpg" \
  -F "folder=nudrrs" \
  -F "tags=emergency,report" \
  http://localhost:8000/api/imagekit/upload/
```

### Upload Base64 Image
```bash
curl -X POST \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "filename": "emergency_report.jpg",
    "folder": "nudrrs",
    "tags": "emergency,report"
  }' \
  http://localhost:8000/api/imagekit/upload-base64/
```

### Get Thumbnail URL
```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  "http://localhost:8000/api/imagekit/thumbnail/FILE_ID/?width=300&height=300"
```

### Get Optimized URL
```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  "http://localhost:8000/api/imagekit/optimized/FILE_ID/?quality=80&format=webp"
```

### Delete Image
```bash
curl -X DELETE \
  -H "Authorization: Token YOUR_TOKEN" \
  http://localhost:8000/api/imagekit/delete/FILE_ID/
```

## Features

### Automatic Image Optimization
- **Format Conversion**: Automatically converts to WebP, AVIF for better performance
- **Quality Optimization**: Reduces file size while maintaining visual quality
- **Responsive Images**: Generates multiple sizes for different devices

### Image Transformations
- **Resize**: Change dimensions while maintaining aspect ratio
- **Crop**: Smart cropping with various modes
- **Quality**: Adjust compression quality (1-100)
- **Format**: Convert between JPEG, PNG, WebP, AVIF

### CDN Delivery
- **Global CDN**: Images served from 100+ locations worldwide
- **Automatic Caching**: Intelligent caching for faster delivery
- **HTTPS**: Secure delivery with SSL certificates

## Integration with Emergency Reports

The system now supports both local file storage and ImageKit:

1. **New Reports**: Images are uploaded to ImageKit by default
2. **Legacy Reports**: Existing local files continue to work
3. **Automatic Fallback**: If ImageKit fails, falls back to local storage
4. **Thumbnail Generation**: Automatic thumbnail creation for faster loading

## Security Features

- **Authentication Required**: All upload endpoints require valid tokens
- **File Type Validation**: Only image files are allowed
- **Size Limits**: Maximum 10MB per file
- **Access Control**: Images are private by default

## Usage in Frontend

```javascript
// Upload image to ImageKit
const formData = new FormData();
formData.append('file', imageFile);
formData.append('folder', 'nudrrs');
formData.append('tags', 'emergency,report');

const response = await fetch('/api/imagekit/upload/', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${token}`
  },
  body: formData
});

const result = await response.json();
if (result.success) {
  const imageUrl = result.data.url;
  const fileId = result.data.file_id;
  // Use the imageUrl in your emergency report
}
```

## Benefits

1. **Performance**: Faster image loading with CDN
2. **Storage**: No local storage required
3. **Optimization**: Automatic image optimization
4. **Scalability**: Handles high traffic loads
5. **Reliability**: 99.9% uptime guarantee
6. **Cost Effective**: Pay only for what you use
