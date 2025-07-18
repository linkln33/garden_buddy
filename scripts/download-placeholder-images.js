#!/usr/bin/env node

/**
 * Script to download placeholder images for the Garden Buddy homepage
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/images');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log(`Created directory: ${IMAGES_DIR}`);
}

// List of images to download
const images = [
  {
    name: 'plant-hero.jpg',
    url: 'https://source.unsplash.com/random/1200x800/?garden,plants',
    description: 'Hero image for the homepage'
  },
  {
    name: 'plant-disease-sample.jpg',
    url: 'https://source.unsplash.com/random/400x400/?plant,disease',
    description: 'Sample image of plant disease for diagnosis demo'
  },
  {
    name: 'field-map-sample.jpg',
    url: 'https://source.unsplash.com/random/800x600/?farm,field,map',
    description: 'Sample image of field map for interactive mapping feature'
  },
  {
    name: 'offline-diagnosis.jpg',
    url: 'https://source.unsplash.com/random/800x600/?farmer,smartphone',
    description: 'Image showing offline diagnosis feature'
  },
  {
    name: 'app-store-badge.png',
    url: 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg',
    description: 'App Store download badge'
  },
  {
    name: 'google-play-badge.png',
    url: 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png',
    description: 'Google Play download badge'
  }
];

/**
 * Download an image from a URL and save it to the filesystem
 * @param {string} url - The URL to download from
 * @param {string} filename - The filename to save as
 * @returns {Promise} - A promise that resolves when the download is complete
 */
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(IMAGES_DIR, filename);
    
    // Create a write stream
    const fileStream = fs.createWriteStream(filePath);
    
    // Download the image
    https.get(url, (response) => {
      // Check if the request was successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      // Pipe the response to the file
      response.pipe(fileStream);
      
      // Handle errors
      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file if there was an error
        reject(err);
      });
      
      // Handle completion
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

// Download all images
async function downloadAllImages() {
  console.log('Starting download of placeholder images...');
  
  for (const image of images) {
    try {
      await downloadImage(image.url, image.name);
    } catch (error) {
      console.error(`Error downloading ${image.name}: ${error.message}`);
    }
  }
  
  console.log('Finished downloading placeholder images.');
}

// Run the download
downloadAllImages().catch(console.error);
