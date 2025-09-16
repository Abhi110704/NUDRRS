e# Cloudinary Setup Guide for NUDRRS

This guide will help you set up Cloudinary for image storage in your NUDRRS project.

## 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

## 2. Get Your Cloudinary Credentials

1. Log in to your Cloudinary dashboard
2. Go to the "Dashboard" section
3. Copy the following values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## 3. Set Environment Variables

Add the following environment variables to your `.env` file or system environment:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 4. Test the Integration

Run the test script to verify everything is working:

```bash
cd backend
source venv/bin/activate
python test_cloudinary.py
```

## 5. Features

### Automatic Image Optimization
- **Format Optimization**: Automatically serves WebP, AVIF, or other optimized formats
- **Quality Optimization**: Automatically adjusts quality based on content
- **Responsive Images**: Automatically generates different sizes

### Image Transformations
You can use Cloudinary's powerful transformation features:

```python
# Example: Resize and optimize image
transformed_url = cloudinary_service.transform_url(
    public_id="nudrrs/reports/report_id/image",
    transformations={
        'width': 800,
        'height': 600,
        'crop': 'fill',
        'quality': 'auto',
        'format': 'auto'
    }
)
```

### Folder Structure
Images are organized in the following structure:
```
nudrrs/
├── reports/
│   ├── {report_id}/
│   │   ├── {report_id}_{uuid}.jpg
│   │   └── {report_id}_{uuid}.png
│   └── test/
│       └── test_image.png
```

## 6. Migration from ImageKit

The system maintains backward compatibility with ImageKit URLs. Existing images will continue to work while new uploads will use Cloudinary.

## 7. Benefits of Cloudinary

- **Better Performance**: Automatic format and quality optimization
- **Global CDN**: Fast image delivery worldwide
- **Advanced Transformations**: Resize, crop, filter, and more
- **Analytics**: Track image usage and performance
- **Free Tier**: 25GB storage, 25GB bandwidth per month

## 8. Troubleshooting

### Common Issues

1. **"Cloudinary not initialized" error**
   - Check that all environment variables are set correctly
   - Verify credentials in Cloudinary dashboard

2. **Upload failures**
   - Check internet connection
   - Verify file size limits (free tier: 10MB max)
   - Check file format support

3. **Authentication errors**
   - Verify API key and secret are correct
   - Check if account is active

### Debug Mode

Enable debug logging by setting:
```python
import logging
logging.getLogger('cloudinary').setLevel(logging.DEBUG)
```

## 9. Security Best Practices

1. **Never expose API Secret** in client-side code
2. **Use signed uploads** for sensitive content
3. **Set up upload presets** for consistent behavior
4. **Use folder restrictions** to prevent unauthorized uploads

## 10. Cost Optimization

- Use automatic format optimization
- Implement lazy loading for images
- Use responsive images with `w_auto` parameter
- Monitor usage in Cloudinary dashboard

For more information, visit the [Cloudinary Documentation](https://cloudinary.com/documentation).
