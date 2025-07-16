import { NextRequest, NextResponse } from 'next/server';

// Claude API configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request: NextRequest) {
  try {
    const { base64Image, plantType } = await request.json();
    
    if (!base64Image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Check if we have Claude API key
    if (!CLAUDE_API_KEY || CLAUDE_API_KEY === 'your-claude-api-key') {
      console.log('Using mock response - no Claude API key');
      return NextResponse.json({ 
        result: getMockPlantDiagnosis(plantType),
        mockResponse: true,
        provider: 'claude'
      });
    }

    // Format image for Claude API
    let imageData = base64Image;
    if (imageData.startsWith('data:image/')) {
      // Extract just the base64 part
      imageData = imageData.split(',')[1];
    }

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert agricultural pathologist. Analyze this plant image and provide a detailed diagnosis.

Plant type: ${plantType || 'Unknown'}

Please respond with a JSON object containing:
{
  "disease": "specific disease name or 'Healthy' if no issues",
  "confidence": 0.85,
  "severity": "Low/Medium/High",
  "description": "detailed description of the condition",
  "symptoms": ["list", "of", "visible", "symptoms"],
  "possibleCauses": ["environmental factors", "pathogens", "etc"],
  "organicTreatments": ["treatment 1", "treatment 2"],
  "chemicalTreatments": ["treatment 1", "treatment 2"],
  "preventiveMeasures": ["prevention tip 1", "prevention tip 2"],
  "urgency": "Low/Medium/High"
}

Focus on common diseases for the plant type. Be specific about treatments and timing.`
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageData
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      
      let errorMessage = 'API_ERROR';
      if (response.status === 402) {
        errorMessage = 'INSUFFICIENT_BALANCE';
      } else if (response.status === 401) {
        errorMessage = 'INVALID_API_KEY';
      }
      
      return NextResponse.json({ 
        result: getMockPlantDiagnosis(plantType),
        mockResponse: true,
        error: errorMessage,
        errorDetails: response.status === 402 ? 'Claude account has insufficient balance. Please add credits or use another provider.' : undefined
      });
    }

    const data = await response.json();
    const aiResponse = data.content[0]?.text;

    if (!aiResponse) {
      throw new Error('No response from Claude API');
    }

    // Parse JSON response
    let diagnosis;
    try {
      diagnosis = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', aiResponse);
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        diagnosis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from Claude');
      }
    }

    // Normalize confidence to 0-1 range
    if (diagnosis.confidence > 1) {
      diagnosis.confidence = diagnosis.confidence / 100;
    }

    return NextResponse.json({ 
      result: diagnosis,
      provider: 'claude'
    });

  } catch (error: any) {
    console.error('Claude API error:', error);
    
    return NextResponse.json({ 
      result: getMockPlantDiagnosis(),
      mockResponse: true,
      error: error.message
    });
  }
}

function getMockPlantDiagnosis(plantType?: string) {
  const diseases = [
    {
      disease: "Powdery Mildew",
      confidence: 0.87,
      severity: "Medium",
      description: "White powdery fungal growth on leaves, common in humid conditions",
      symptoms: ["White powdery coating on leaves", "Yellowing of affected areas", "Stunted growth"],
      possibleCauses: ["High humidity", "Poor air circulation", "Overcrowding"],
      organicTreatments: ["Baking soda spray (1 tsp per quart water)", "Neem oil application", "Milk spray (1:10 ratio)"],
      chemicalTreatments: ["Fungicide with myclobutanil", "Sulfur-based fungicide"],
      preventiveMeasures: ["Improve air circulation", "Avoid overhead watering", "Space plants properly"],
      urgency: "Medium"
    },
    {
      disease: "Leaf Spot Disease",
      confidence: 0.82,
      severity: "Low",
      description: "Circular brown spots on leaves, typically caused by bacterial or fungal infection",
      symptoms: ["Brown circular spots", "Yellow halos around spots", "Leaf yellowing"],
      possibleCauses: ["Wet leaves", "Poor sanitation", "Infected plant debris"],
      organicTreatments: ["Copper fungicide", "Remove affected leaves", "Improve drainage"],
      chemicalTreatments: ["Chlorothalonil fungicide", "Mancozeb application"],
      preventiveMeasures: ["Water at soil level", "Remove plant debris", "Rotate crops"],
      urgency: "Low"
    }
  ];
  
  return diseases[Math.floor(Math.random() * diseases.length)];
}
