import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

// Force reload the API key from environment variables to avoid caching issues
const forceReloadApiKey = () => {
  try {
    // This is a hack to force Next.js to reload environment variables
    // by accessing them in a different way
    return process.env.OPENAI_API_KEY || '';
  } catch (e) {
    console.error('Error accessing API key:', e);
    return '';
  }
};

const actualApiKey = forceReloadApiKey() || apiKey;

// Log API key status for debugging (without exposing the key)
console.log('OpenAI API Key status:', actualApiKey ? 
  (actualApiKey === 'your-openai-api-key' ? 'INVALID (placeholder)' : 
   `VALID (${actualApiKey.substring(0, 5)}...)`) : 
  'MISSING');

// Create a mock OpenAI client if the API key is not available
let openai: OpenAI;

if (actualApiKey && actualApiKey !== 'your-openai-api-key' && actualApiKey.startsWith('sk-')) {
  try {
    openai = new OpenAI({ apiKey: actualApiKey });
    console.log('Using real OpenAI client with key starting with:', actualApiKey.substring(0, 5));
  } catch (error) {
    console.error('Error initializing OpenAI client:', error);
    useMockClient();
  }
} else {
  console.log('Using mock OpenAI client - NO VALID API KEY FOUND');
  useMockClient();
}

function useMockClient() {
  openai = {
    chat: {
      completions: {
        create: async () => ({
          choices: [{
            message: {
              content: JSON.stringify({
                diseaseName: 'Mock Plant Disease',
                confidenceScore: 0.85,
                description: 'This is a mock response because no valid OpenAI API key was provided.',
                plantType: 'Mock Plant',
                severity: 'Moderate',
                possibleCauses: ['Mock Cause 1', 'Mock Cause 2'],
                preventiveMeasures: ['Mock Prevention 1', 'Mock Prevention 2']
              })
            }
          }]
        })
      }
    }
  } as unknown as OpenAI;
}

/**
 * Analyzes a plant image to detect diseases using GPT-4 Vision
 * @param base64Image - The base64-encoded image to analyze
 * @returns An object containing the disease name, confidence score, and description
 */
export async function detectPlantDisease(base64Image: string) {
  try {
    // Ensure the base64Image is properly formatted for the API
    const formattedBase64 = base64Image.startsWith('data:') 
      ? base64Image 
      : `data:image/jpeg;base64,${base64Image}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
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
            { type: 'image_url', image_url: { url: formattedBase64 } }
          ]
        }
      ],
      temperature: 0.2, // Lower temperature for more deterministic responses
    });

    // Parse the response content as JSON
    const content = response.choices[0]?.message?.content;
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
      return {
        diseaseName: parsedResult.diseaseName || 'Unknown',
        confidenceScore: parsedResult.confidenceScore || 0,
        description: parsedResult.description || 'No description provided',
        plantType: parsedResult.plantType || 'Unknown',
        severity: parsedResult.severity || 'Unknown',
        possibleCauses: parsedResult.possibleCauses || [],
        preventiveMeasures: parsedResult.preventiveMeasures || []
      };
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return {
        diseaseName: 'Error',
        confidenceScore: 0,
        description: 'Failed to parse AI response. Please try again.',
        plantType: 'Unknown',
        severity: 'Unknown',
        possibleCauses: [],
        preventiveMeasures: []
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return {
      diseaseName: 'Error',
      confidenceScore: 0,
      description: 'Failed to analyze the image. Please check your connection and try again.',
      plantType: 'Unknown'
    };
  }
}

/**
 * Gets treatment recommendations for a plant disease
 * @param diseaseName - The name of the disease
 * @param plantType - The type of plant
 * @param preferOrganic - Whether to prefer organic treatments
 * @returns An object containing organic and chemical treatment options
 */
export async function getTreatmentRecommendations(
  diseaseName: string,
  plantType: string,
  preferOrganic: boolean = false
) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an agricultural expert specializing in plant disease treatments.
          Provide treatment recommendations for the specified plant disease.
          Return your response in the following JSON format:
          {
            "organicTreatments": [
              {
                "name": "Treatment name",
                "description": "How to apply the treatment",
                "effectiveness": "High/Medium/Low",
                "materials": ["material1", "material2"]
              }
            ],
            "chemicalTreatments": [
              {
                "name": "Treatment name",
                "description": "How to apply the treatment",
                "effectiveness": "High/Medium/Low",
                "activeIngredients": ["ingredient1", "ingredient2"],
                "safetyPrecautions": "Safety information"
              }
            ],
            "preventiveMeasures": [
              "Preventive measure 1",
              "Preventive measure 2"
            ]
          }
          
          ${preferOrganic ? 'Prioritize organic treatments in your recommendations.' : ''}
          If the disease is unknown, provide general recommendations for plant health.`
        },
        {
          role: 'user',
          content: `Please provide treatment recommendations for ${diseaseName} on ${plantType || 'a plant'}.`,
        },
      ],
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '';
    
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```\n([\s\S]*?)\n```/) || 
                        [null, content];
      
      const jsonContent = jsonMatch[1] || content;
      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Error parsing GPT response:', parseError);
      return {
        organicTreatments: [],
        chemicalTreatments: [],
        preventiveMeasures: ['Failed to get treatment recommendations. Please try again.']
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return {
      organicTreatments: [],
      chemicalTreatments: [],
      preventiveMeasures: ['Failed to get treatment recommendations. Please check your connection and try again.']
    };
  }
}
