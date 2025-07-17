/**
 * EU Pesticide CSV Parser - JavaScript version for setup scripts
 * Parses EU Pesticide Database CSV files into structured data
 */

/**
 * Parses EU Pesticide CSV data into structured format
 */
function parseEUPesticideCSV(csvContent) {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCSVLine(line);
        if (values.length < headers.length) continue;
        
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index]?.replace(/"/g, '') || '';
        });
        
        try {
            const record = {
                activeSubstance: row['Active substance'] || '',
                productName: row['Product name'] || '',
                registrationNumber: row['Registration number'] || '',
                approvalStatus: normalizeApprovalStatus(row['Approval status']),
                approvalDate: row['Approval date'] || '',
                expiryDate: row['Expiry date'] || '',
                approvedCrops: parseApprovedCrops(row['Approved crops']),
                mrlValues: parseMRLValues(row['MRL (mg/kg)']),
                memberStates: parseMemberStates(row['Member states']),
                restrictions: parseRestrictions(row['Restrictions']),
                hazardClassification: parseHazardClassification(row['Hazard classification'])
            };
            
            records.push(record);
        } catch (error) {
            console.warn(`Failed to parse row ${i}:`, error);
        }
    }
    
    return records;
}

/**
 * Helper function to parse CSV line with proper quote handling
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

/**
 * Normalizes approval status to standard values
 */
function normalizeApprovalStatus(status) {
    const normalized = status.toLowerCase().trim();
    
    if (normalized.includes('approved') || normalized.includes('authorised')) {
        return 'approved';
    } else if (normalized.includes('pending') || normalized.includes('under review')) {
        return 'pending';
    } else if (normalized.includes('withdrawn') || normalized.includes('cancelled')) {
        return 'withdrawn';
    } else if (normalized.includes('expired') || normalized.includes('not renewed')) {
        return 'expired';
    }
    
    return 'approved'; // Default assumption
}

/**
 * Parses approved crops from semicolon-separated string
 */
function parseApprovedCrops(cropsString) {
    if (!cropsString) return [];
    
    return cropsString
        .split(';')
        .map(crop => crop.trim())
        .filter(crop => crop.length > 0)
        .map(crop => standardizeCropName(crop));
}

/**
 * Parses MRL values from formatted string
 */
function parseMRLValues(mrlString) {
    if (!mrlString) return [];
    
    const mrlValues = [];
    
    // Example format: "Apples: 0.5 mg/kg; Grapes: 1.0 mg/kg"
    const entries = mrlString.split(';');
    
    for (const entry of entries) {
        const match = entry.match(/(.+?):\s*([0-9.]+)\s*(mg\/kg|ppm)/i);
        if (match) {
            mrlValues.push({
                crop: standardizeCropName(match[1].trim()),
                mrl: parseFloat(match[2]),
                unit: match[3].toLowerCase()
            });
        }
    }
    
    return mrlValues;
}

/**
 * Parses member states from comma-separated string
 */
function parseMemberStates(statesString) {
    if (!statesString) return [];
    
    return statesString
        .split(',')
        .map(state => state.trim().toUpperCase())
        .filter(state => state.length > 0);
}

/**
 * Parses restrictions from formatted string
 */
function parseRestrictions(restrictionsString) {
    if (!restrictionsString) return [];
    
    return restrictionsString
        .split(';')
        .map(restriction => restriction.trim())
        .filter(restriction => restriction.length > 0);
}

/**
 * Parses hazard classification codes
 */
function parseHazardClassification(hazardString) {
    if (!hazardString) return [];
    
    return hazardString
        .split(',')
        .map(hazard => hazard.trim())
        .filter(hazard => hazard.length > 0);
}

/**
 * Standardizes crop names to match our database
 */
function standardizeCropName(cropName) {
    const standardNames = {
        'grape': 'grapes',
        'vine': 'grapes',
        'vitis vinifera': 'grapes',
        'tomato': 'tomatoes',
        'solanum lycopersicum': 'tomatoes',
        'cucumber': 'cucumbers',
        'cucumis sativus': 'cucumbers',
        'apple': 'apples',
        'malus domestica': 'apples',
        'wheat': 'wheat',
        'triticum aestivum': 'wheat',
        'maize': 'corn',
        'zea mays': 'corn',
        'potato': 'potatoes',
        'solanum tuberosum': 'potatoes'
    };
    
    const normalized = cropName.toLowerCase().trim();
    return standardNames[normalized] || cropName;
}

/**
 * Calculates safety rating based on hazard classification
 */
function calculateSafetyRating(hazardCodes) {
    if (hazardCodes.length === 0) return 3; // Neutral rating
    
    let riskScore = 0;
    
    for (const code of hazardCodes) {
        const upperCode = code.toUpperCase();
        
        // High risk codes
        if (upperCode.includes('H300') || upperCode.includes('H310') || upperCode.includes('H330')) {
            riskScore += 3; // Fatal if swallowed/skin contact/inhaled
        } else if (upperCode.includes('H301') || upperCode.includes('H311') || upperCode.includes('H331')) {
            riskScore += 2; // Toxic if swallowed/skin contact/inhaled
        } else if (upperCode.includes('H302') || upperCode.includes('H312') || upperCode.includes('H332')) {
            riskScore += 1; // Harmful if swallowed/skin contact/inhaled
        }
        
        // Environmental risk
        if (upperCode.includes('H400') || upperCode.includes('H410')) {
            riskScore += 2; // Very toxic to aquatic life
        } else if (upperCode.includes('H401') || upperCode.includes('H411')) {
            riskScore += 1; // Toxic to aquatic life
        }
    }
    
    // Convert to 1-5 scale (1 = high risk, 5 = low risk)
    if (riskScore >= 6) return 1;
    if (riskScore >= 4) return 2;
    if (riskScore >= 2) return 3;
    if (riskScore >= 1) return 4;
    return 5;
}

/**
 * Imports EU pesticide data into Supabase
 */
async function importEUPesticideData(records, supabase) {
    console.log(`📊 Importing ${records.length} EU pesticide records...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const record of records) {
        try {
            // Check if pesticide product already exists
            const { data: existingProduct } = await supabase
                .from('pesticide_products')
                .select('id')
                .eq('name', record.productName)
                .single();
            
            if (existingProduct) {
                // Update existing product with EU data
                await supabase
                    .from('pesticide_products')
                    .update({
                        eu_approved: record.approvalStatus === 'approved',
                        eu_approval_date: record.approvalDate || null,
                        eu_expiry_date: record.expiryDate || null,
                        eu_registration_number: record.registrationNumber,
                        eu_member_states: record.memberStates,
                        eu_restrictions: record.restrictions,
                        eu_hazard_classification: record.hazardClassification,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingProduct.id);
            } else {
                // Create new pesticide product
                const { data: newProduct } = await supabase
                    .from('pesticide_products')
                    .insert({
                        name: record.productName,
                        active_ingredient: record.activeSubstance,
                        type: 'chemical', // Default type
                        eu_approved: record.approvalStatus === 'approved',
                        eu_approval_date: record.approvalDate || null,
                        eu_expiry_date: record.expiryDate || null,
                        eu_registration_number: record.registrationNumber,
                        eu_member_states: record.memberStates,
                        eu_restrictions: record.restrictions,
                        eu_hazard_classification: record.hazardClassification,
                        description: `EU registered pesticide containing ${record.activeSubstance}`,
                        manufacturer: 'EU Registered',
                        safety_rating: calculateSafetyRating(record.hazardClassification)
                    })
                    .select()
                    .single();
                
                // Add MRL data
                if (newProduct && record.mrlValues.length > 0) {
                    for (const mrl of record.mrlValues) {
                        await supabase
                            .from('pesticide_dosages')
                            .insert({
                                pesticide_id: newProduct.id,
                                crop: mrl.crop,
                                mrl_value: mrl.mrl,
                                mrl_unit: mrl.unit,
                                eu_compliant: true,
                                notes: `EU MRL: ${mrl.mrl} ${mrl.unit}`
                            });
                    }
                }
            }
            
            successCount++;
        } catch (error) {
            console.error(`Failed to import record: ${record.productName}`, error);
            errorCount++;
        }
    }
    
    console.log(`✅ Import complete: ${successCount} successful, ${errorCount} errors`);
    return { successCount, errorCount };
}

module.exports = {
    parseEUPesticideCSV,
    importEUPesticideData,
    calculateSafetyRating,
    standardizeCropName,
    normalizeApprovalStatus,
    parseMRLValues,
    parseApprovedCrops,
    parseMemberStates,
    parseRestrictions,
    parseHazardClassification
};
