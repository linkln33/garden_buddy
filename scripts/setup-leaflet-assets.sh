#!/bin/bash

# Script to set up Leaflet marker icons for the interactive weather map
# This downloads the required marker icons from the Leaflet color markers repository

echo "Setting up Leaflet marker icons for Garden Buddy..."

# Create the leaflet directory in public if it doesn't exist
mkdir -p public/leaflet

# Download the marker icons
echo "Downloading marker icons..."
curl -o public/leaflet/marker-icon.png https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png
curl -o public/leaflet/marker-icon-2x.png https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png
curl -o public/leaflet/marker-shadow.png https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png

# Download additional colored markers for different field types
echo "Downloading additional colored markers for field types..."
curl -o public/leaflet/marker-icon-green.png https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png
curl -o public/leaflet/marker-icon-red.png https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png
curl -o public/leaflet/marker-icon-orange.png https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png
curl -o public/leaflet/marker-icon-yellow.png https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png

echo "Leaflet assets setup complete!"
echo "You can now use the interactive weather map component."
