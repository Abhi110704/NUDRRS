#!/bin/bash
set -e

# Install dependencies
npm install

# Build the app
npm run build

# Create a static folder for serving
mkdir -p static
cp -r build/* static/