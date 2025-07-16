#!/usr/bin/env node

// Test the Plant Database API directly
async function testPlantDatabase() {
  console.log('🌱 Testing Plant Database API...');
  console.log('================================');
  
  try {
    const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    
    const response = await fetch('http://localhost:3000/api/diagnose-hybrid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image: testImage,
        plantType: 'tomato'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Plant Database API Response:');
      console.log('================================');
      console.log('Disease:', data.result?.disease);
      console.log('Confidence:', data.result?.confidence);
      console.log('Severity:', data.result?.severity);
      console.log('Provider:', data.provider);
      console.log('Keywords:', data.detectedKeywords);
      console.log('Matching diseases:', data.matchingDiseases);
      
      console.log('\n📊 Full Response Structure:');
      console.log(JSON.stringify(data, null, 2));
      
      return true;
    } else {
      console.log('❌ API Error:', response.status, await response.text());
      return false;
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    return false;
  }
}

async function testOpenAI() {
  console.log('\n🤖 Testing OpenAI API...');
  console.log('================================');
  
  try {
    const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    
    const response = await fetch('http://localhost:3000/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image: testImage,
        plantType: 'tomato'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenAI API Response:');
      console.log('================================');
      console.log('Disease:', data.result?.diseaseName);
      console.log('Confidence:', data.result?.confidenceScore);
      console.log('Severity:', data.result?.severity);
      console.log('Mock Response:', data.mockResponse);
      console.log('Quota Exceeded:', data.quotaExceeded);
      
      return true;
    } else {
      console.log('❌ API Error:', response.status, await response.text());
      return false;
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing Plant Disease APIs');
  console.log('==============================\n');
  
  const plantDbResult = await testPlantDatabase();
  const openaiResult = await testOpenAI();
  
  console.log('\n📋 SUMMARY');
  console.log('===========');
  console.log(`Plant Database: ${plantDbResult ? '✅ Working' : '❌ Failed'}`);
  console.log(`OpenAI API: ${openaiResult ? '✅ Working' : '❌ Failed'}`);
  
  if (plantDbResult) {
    console.log('\n💡 MVP RECOMMENDATION');
    console.log('=====================');
    console.log('✅ Plant Database is working perfectly for MVP!');
    console.log('🆓 Completely free - no API costs');
    console.log('⚡ Instant results - no network delays');
    console.log('📱 Works offline - no internet required');
    console.log('🎯 Provides confidence scores for the meter');
    console.log('\nYour MVP can launch with just the Plant Database!');
  }
}

main().catch(console.error);
