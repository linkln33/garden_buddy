import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/supabase/types';

// This is a server-side API route, so environment variables are properly loaded
const apiKey = process.env.OPENAI_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    // Check if we have a valid API key
    console.log('OpenAI API key check:', {
      exists: !!apiKey,
      isPlaceholder: apiKey === 'your-openai-api-key',
      startsWithSk: apiKey?.startsWith('sk-')
    });
    
    if (!apiKey || apiKey === 'your-openai-api-key' || !apiKey.startsWith('sk-')) {
      console.log('Using mock response due to invalid API key');
      return NextResponse.json({ 
        result: getMockResponse(),
        mockResponse: true
      });
    }

    const { base64Image } = await request.json();
    
    if (!base64Image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }
    
    console.log('Image data received, length:', base64Image.length);
    
    // Format the base64 string for OpenAI API
    let formattedBase64 = base64Image;
    if (!formattedBase64.startsWith('data:')) {
      formattedBase64 = `data:image/jpeg;base64,${formattedBase64}`;
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    try {
      const response = await callOpenAI(openai, 'gpt-4o', formattedBase64);
      console.log('OpenAI API response received:', {
        status: 'success',
        model: 'gpt-4o',
        hasChoices: !!response.choices?.length
      });
      return processOpenAIResponse(response);
    } catch (error: any) {
      console.error('Error with gpt-4o model:', {
        message: error.message,
        code: error.code,
        status: error.status,
        stack: error.stack
      });
      
      // Check for quota exceeded error
      if (error.code === 'insufficient_quota' || error.status === 429) {
        console.log('API quota exceeded, using mock response');
        return NextResponse.json({ 
          result: getMockResponse(),
          mockResponse: true,
          quotaExceeded: true
        });
      }
      
      // Try with gpt-4-vision-preview as fallback
      try {
        console.log('Falling back to gpt-4-vision-preview model');
        const response = await callOpenAI(openai, 'gpt-4-vision-preview', formattedBase64);
        return processOpenAIResponse(response);
      } catch (error2: any) {
        console.error('Error with gpt-4-vision-preview model:', {
          message: error2.message,
          code: error2.code,
          status: error2.status
        });
        
        // Check for quota exceeded error
        if (error2.code === 'insufficient_quota' || error2.status === 429) {
          console.log('API quota exceeded, using mock response');
          return NextResponse.json({ 
            result: getMockResponse(),
            mockResponse: true,
            quotaExceeded: true
          });
        }
        
        // Try with gpt-3.5-turbo as last resort
        try {
          console.log('Falling back to gpt-3.5-turbo model');
          const response = await callOpenAI(openai, 'gpt-3.5-turbo', formattedBase64);
          return processOpenAIResponse(response);
        } catch (error3: any) {
          console.error('All OpenAI model attempts failed:', error3);
          
          // Check for quota exceeded error
          if (error3.code === 'insufficient_quota' || error3.status === 429) {
            console.log('API quota exceeded, using mock response');
            return NextResponse.json({ 
              result: getMockResponse(),
              mockResponse: true,
              quotaExceeded: true
            });
          }
          
          // Check if we have a cached diagnosis for this image
          const cachedDiagnosis = await getCachedDiagnosis(base64Image);
          if (cachedDiagnosis) {
            console.log('Using cached diagnosis');
            return NextResponse.json({
              result: cachedDiagnosis,
              cached: true
            });
          }
          
          // Return mock data as last resort
          console.log('Error calling OpenAI API:', error3);
          return NextResponse.json({ 
            result: getMockResponse(),
            mockResponse: true,
            error: error3.message
          });
        }
      }
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze the image',
      mockResponse: true,
      result: getMockResponse()
    }, { status: 200 }); // Return 200 with mock data instead of 500
  }
}

// Function to call OpenAI API with specified model
async function callOpenAI(openai: OpenAI, model: string, formattedBase64: string) {
  console.log(`Calling OpenAI API with model: ${model}`);
  
  try {
    // Ensure the image is properly formatted
    const imageUrl = formattedBase64.startsWith('data:') 
      ? formattedBase64 
      : `data:image/jpeg;base64,${formattedBase64}`;
    
    // Log the first 100 characters of the image URL to verify format
    console.log('Image URL format check:', {
      prefix: imageUrl.substring(0, 30) + '...',
      length: imageUrl.length
    });
    
    return await openai.chat.completions.create({
      model: model,
      max_tokens: 1000,
      messages: [
          {
            role: 'system',
            content: `You are a plant disease detection expert. Analyze the image and identify any plant diseases.
            Be thorough in your analysis and consider common diseases for the identified plant type.
            Return your response in the following JSON format:
            {
              "diseaseName": "Name of the disease",
              "confidenceScore": 0.95, // A number between 0 and 1 representing your confidence
              "description": "Brief description of the disease including symptoms and causes",
              "plantType": "Type of plant if identifiable",
              "severity": "Low, Moderate, or High",
              "possibleCauses": ["List of possible causes"],
              "preventiveMeasures": ["List of preventive measures"]
            }
            
            If you cannot identify the disease with at least 60% confidence, set diseaseName to "Unknown" and provide possible causes.
            If the image is not of a plant, respond with an appropriate error message.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identify any plant diseases in this image. Look for discoloration, spots, wilting, or other abnormalities. Consider the plant type and common diseases that affect it.' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.2, // Lower temperature for more deterministic responses
      });
  } catch (error: any) {
    console.error('Error in callOpenAI function:', error);
    throw error;
  }
}

// Process OpenAI API response
function processOpenAIResponse(apiResponse: any) {
  const content = apiResponse.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in response');
  }
  
  try {
    // Extract JSON from the response (in case the model includes additional text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : content;
    
    const parsedResult = JSON.parse(jsonContent);
    
    // Normalize the confidence score to be between 0 and 1
    if (parsedResult.confidenceScore > 1) {
      parsedResult.confidenceScore = parsedResult.confidenceScore / 100;
    }
    
    // Add default values for any missing fields
    const result = {
      diseaseName: parsedResult.diseaseName || 'Unknown',
      confidenceScore: parsedResult.confidenceScore || 0,
      description: parsedResult.description || 'No description provided',
      plantType: parsedResult.plantType || 'Unknown',
      severity: parsedResult.severity || 'Unknown',
      possibleCauses: parsedResult.possibleCauses || [],
      preventiveMeasures: parsedResult.preventiveMeasures || []
    };
    
    // Cache the diagnosis in Supabase if available
    if (supabase) {
      try {
        // Use non-null assertion since we already checked if supabase exists
        void supabase!.from('cached_diagnoses').insert({
          diagnosis: result,
          image_hash: hashImage(jsonContent.substring(0, 100)), // Simple hash for matching similar images
          created_at: new Date().toISOString()
        });
      } catch (cacheError) {
        console.error('Failed to cache diagnosis:', cacheError);
      }
    }
    
    return NextResponse.json({ result, mockResponse: false });
  } catch (parseError) {
    console.error('Error parsing JSON response:', parseError);
    return NextResponse.json(
      { 
        error: 'Failed to parse AI response',
        rawContent: content,
        mockResponse: true,
        result: getMockResponse()
      },
      { status: 200 }
    );
  }
}

// Get cached diagnosis from Supabase
async function getCachedDiagnosis(imageBase64: string) {
  if (!supabase) return null;
  
  try {
    const { data } = await supabase
      .from('cached_diagnoses')
      .select('diagnosis')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (data && data.length > 0) {
      return data[0].diagnosis;
    }
    return null;
  } catch (error) {
    console.error('Error fetching cached diagnosis:', error);
    return null;
  }
}

// Simple hash function for image matching
function hashImage(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

// Mock response for testing
function getMockResponse() {
  return {
    diseaseName: 'Mock Plant Disease',
    confidenceScore: 0.85,
    description: 'This is a mock response because the OpenAI API quota has been exceeded or there was an error with the API call.',
    plantType: 'Mock Plant',
    severity: 'Moderate',
    possibleCauses: ['Mock Cause 1', 'Mock Cause 2'],
    preventiveMeasures: ['Mock Prevention 1', 'Mock Prevention 2']
  };
}
