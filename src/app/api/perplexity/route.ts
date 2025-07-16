import { NextResponse } from 'next/server';

/**
 * API route for Perplexity AI plant disease diagnosis
 * 
 * This endpoint accepts a base64 image and plant type, then sends it to Perplexity AI
 * for analysis and returns a structured diagnosis response.
 */
export async function POST(request: Request) {
  try {
    const { image, plantType } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Check if Perplexity API key exists
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      console.error('Perplexity API key not found');
      return NextResponse.json(
        { 
          error: 'Perplexity API key not configured',
          mockResponse: true,
          diagnosis: getMockDiagnosis(plantType)
        },
        { status: 200 }
      );
    }

    // Prepare the prompt for Perplexity
    const prompt = `
      I'm sending you an image of a plant that may have a disease. 
      The plant type is: ${plantType || 'unknown'}.
      
      Please analyze the image and provide a detailed diagnosis with the following information in JSON format:
      
      1. Identified disease name
      2. Confidence level (0-1)
      3. Description of the disease
      4. Symptoms visible in the image
      5. Possible causes
      6. Organic treatment options
      7. Chemical treatment options
      8. Preventive measures
      9. Severity level (low, medium, high)
      
      Return ONLY valid JSON without any other text.
    `;

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'pplx-vision-beta', // Perplexity's vision model
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1024,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Perplexity API error:', errorData);
      return NextResponse.json(
        { 
          error: `Perplexity API error: ${response.status}`,
          mockResponse: true,
          diagnosis: getMockDiagnosis(plantType)
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    
    // Parse the response content
    let diagnosisData;
    try {
      // Extract the JSON from the response
      const content = data.choices[0].message.content;
      diagnosisData = JSON.parse(content);
    } catch (error) {
      console.error('Error parsing Perplexity response:', error);
      return NextResponse.json(
        { 
          error: 'Failed to parse Perplexity response',
          mockResponse: true,
          diagnosis: getMockDiagnosis(plantType)
        },
        { status: 200 }
      );
    }

    // Format the response to match our standard diagnosis format
    const formattedDiagnosis = {
      disease: diagnosisData.disease_name || diagnosisData.identified_disease_name,
      confidence: diagnosisData.confidence_level,
      description: diagnosisData.description,
      symptoms: diagnosisData.symptoms,
      causes: diagnosisData.possible_causes,
      organic_treatment: diagnosisData.organic_treatment_options,
      chemical_treatment: diagnosisData.chemical_treatment_options,
      prevention: diagnosisData.preventive_measures,
      severity: diagnosisData.severity_level,
      source: 'Perplexity AI'
    };

    return NextResponse.json({
      diagnosis: formattedDiagnosis,
      mockResponse: false
    });
    
  } catch (error) {
    console.error('Error in Perplexity API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        mockResponse: true,
        diagnosis: getMockDiagnosis()
      },
      { status: 500 }
    );
  }
}

/**
 * Provides a mock diagnosis response when the API is unavailable
 */
function getMockDiagnosis(plantType?: string) {
  return {
    disease: 'Unknown Disease',
    confidence: 0.7,
    description: 'This is a mock diagnosis because the Perplexity API is not configured or encountered an error.',
    symptoms: ['Leaf spots', 'Wilting', 'Discoloration'],
    causes: ['Fungal infection', 'Environmental stress', 'Nutrient deficiency'],
    organic_treatment: ['Remove affected leaves', 'Apply neem oil', 'Improve air circulation'],
    chemical_treatment: ['Apply fungicide as directed', 'Use copper-based sprays'],
    prevention: ['Proper spacing between plants', 'Avoid overhead watering', 'Crop rotation'],
    severity: 'medium',
    source: 'Mock Data (Perplexity API not available)'
  };
}
