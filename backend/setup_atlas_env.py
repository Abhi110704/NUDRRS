#!/usr/bin/env python
"""
Setup script to configure MongoDB Atlas environment variables
This script helps you set up your .env file for MongoDB Atlas
"""

import os
from pathlib import Path

def create_env_file():
    """Create .env file with MongoDB Atlas configuration"""
    backend_dir = Path(__file__).resolve().parent
    env_file = backend_dir / '.env'
    
    print("🔧 MongoDB Atlas Environment Setup")
    print("=" * 40)
    
    # Check if .env already exists
    if env_file.exists():
        print("⚠️  .env file already exists!")
        response = input("Do you want to overwrite it? (y/N): ").lower()
        if response != 'y':
            print("❌ Setup cancelled")
            return
    
    print("\n📝 Please provide the following information:")
    print("(Press Enter to use default values)")
    
    # Get MongoDB Atlas URI
    atlas_uri = input("\n🔗 MongoDB Atlas URI (mongodb+srv://...): ").strip()
    if not atlas_uri:
        atlas_uri = "mongodb+srv://username:password@cluster.mongodb.net/"
        print(f"   Using default: {atlas_uri}")
    
    # Get database name
    db_name = input("\n🗄️  Database name [nudrrs_mongodb]: ").strip()
    if not db_name:
        db_name = "nudrrs_mongodb"
    
    # Get secret key
    secret_key = input("\n🔐 Django Secret Key [auto-generated]: ").strip()
    if not secret_key:
        import secrets
        secret_key = secrets.token_urlsafe(50)
        print(f"   Generated: {secret_key[:20]}...")
    
    # Create .env content
    env_content = f"""# Django Settings
SECRET_KEY={secret_key}
DEBUG=True

# MongoDB Atlas Configuration
MONGODB_ATLAS_URI={atlas_uri}
MONGODB_DB_NAME={db_name}
MONGODB_PORT=27017

# Optional API Keys (uncomment and fill as needed)
# GOOGLE_MAPS_API_KEY=your-google-maps-api-key
# GEMINI_API_KEY=your-gemini-api-key
# OPENAI_API_KEY=your-openai-api-key
# TWILIO_ACCOUNT_SID=your-twilio-account-sid
# TWILIO_AUTH_TOKEN=your-twilio-auth-token
"""
    
    # Write .env file
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        
        print(f"\n✅ .env file created successfully!")
        print(f"   Location: {env_file}")
        
        print("\n📋 Next steps:")
        print("   1. Edit the .env file and replace 'username:password' with your actual Atlas credentials")
        print("   2. Replace 'cluster' with your actual cluster name")
        print("   3. Run: python test_mongodb_atlas.py")
        print("   4. Start your Django server: python run_server.py")
        
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")

if __name__ == "__main__":
    create_env_file()
