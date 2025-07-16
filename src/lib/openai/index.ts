import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

// Create a mock OpenAI client if the API key is not available
const openai = apiKey && apiKey !== 'your-openai-api-key'
  ? new OpenAI({ apiKey })
  : {
      chat: {
        completions: {
          create: async () => ({
            choices: [{
              message: {
                content: JSON.stringify({
                  disease: 'Mock Disease',
                  confidence: 0.95,
                  description: 'This is a mock response because no valid OpenAI API key was provided.',
                  symptoms: ['Yellow leaves', 'Spots', 'Wilting'],
                  severity: 'Moderate',
                })
              }
            }]
          })
        }
      }
    } as unknown as OpenAI;

/**
 * Analyzes a plant image to detect diseases using GPT-4 Vision
 * @param base64Image - The base64-encoded image to analyze
 * @returns An object containing the disease name, confidence score, and description
 */
export async function detectPlantDisease(base64Image: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content: `You are a plant disease detection expert. Analyze the image and identify any plant diseases.
          Return your response in the following JSON format:
          {
            "diseaseName": "Name of the disease",
            "confidenceScore": 0.95, // A number between 0 and 1 representing your confidence
            "description": "Brief description of the disease",
            "plantType": "Type of plant if identifiable"
          }
          
          If you cannot identify the disease with at least 60% confidence, set diseaseName to "Unknown" and provide possible causes.
          If the image is not of a plant, respond with an appropriate error message.`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What disease does this plant have?' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    // Parse the response to extract the JSON
    const content = response.choices[0]?.message?.content || '';
    
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```\n([\s\S]*?)\n```/) || 
                        [null, content];
      
      const jsonContent = jsonMatch[1] || content;
      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Error parsing GPT response:', parseError);
      return {
        diseaseName: 'Error',
        confidenceScore: 0,
        description: 'Failed to parse the AI response. Please try again.',
        plantType: 'Unknown'
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
