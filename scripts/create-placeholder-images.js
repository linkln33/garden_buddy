#!/usr/bin/env node

/**
 * Script to create placeholder images for the Garden Buddy homepage
 * This is a fallback since we couldn't download from Unsplash
 */
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log(`Created directory: ${IMAGES_DIR}`);
}

// Create a simple HTML placeholder image
function createPlaceholderImage(filename, width, height, text, bgColor = '#4CAF50', textColor = '#FFFFFF') {
  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <text x="50%" y="50%" font-family="Arial" font-size="24" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>
`;
  
  const filePath = path.join(IMAGES_DIR, filename);
  fs.writeFileSync(filePath, svg);
  console.log(`Created placeholder image: ${filename}`);
}

// Create all required placeholder images
console.log('Creating placeholder images...');

createPlaceholderImage('plant-hero.jpg', 1200, 800, 'Garden Buddy Hero Image');
createPlaceholderImage('plant-disease-sample.jpg', 400, 400, 'Plant Disease Sample');
createPlaceholderImage('field-map-sample.jpg', 800, 600, 'Field Map Sample', '#2196F3');
createPlaceholderImage('offline-diagnosis.jpg', 800, 600, 'Offline Diagnosis Feature', '#FF9800');

console.log('Finished creating placeholder images.');
