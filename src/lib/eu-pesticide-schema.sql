-- EU Pesticide Database Schema Extensions
-- Adds EU-specific columns to existing pesticide tables

-- Add EU-specific columns to pesticide_products table
ALTER TABLE pesticide_products 
ADD COLUMN IF NOT EXISTS eu_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS eu_approval_date DATE,
ADD COLUMN IF NOT EXISTS eu_expiry_date DATE,
ADD COLUMN IF NOT EXISTS eu_registration_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS eu_member_states TEXT[],
ADD COLUMN IF NOT EXISTS eu_restrictions TEXT[],
ADD COLUMN IF NOT EXISTS eu_hazard_classification TEXT[],
ADD COLUMN IF NOT EXISTS eu_active_substance VARCHAR(255),
ADD COLUMN IF NOT EXISTS eu_last_updated TIMESTAMP DEFAULT NOW();

-- Add EU-specific columns to pesticide_dosages table
ALTER TABLE pesticide_dosages 
ADD COLUMN IF NOT EXISTS mrl_value DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS mrl_unit VARCHAR(20) DEFAULT 'mg/kg',
ADD COLUMN IF NOT EXISTS eu_compliant BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS eu_mrl_source VARCHAR(255),
ADD COLUMN IF NOT EXISTS eu_last_verified TIMESTAMP DEFAULT NOW();

-- Create EU pesticide approval status index
CREATE INDEX IF NOT EXISTS idx_pesticide_products_eu_approved 
ON pesticide_products(eu_approved) WHERE eu_approved = true;

-- Create EU expiry date index for active products
CREATE INDEX IF NOT EXISTS idx_pesticide_products_eu_expiry 
ON pesticide_products(eu_expiry_date) WHERE eu_expiry_date IS NOT NULL;

-- Create MRL compliance index
CREATE INDEX IF NOT EXISTS idx_pesticide_dosages_eu_compliant 
ON pesticide_dosages(eu_compliant, crop) WHERE eu_compliant = true;

-- Create function to add EU columns safely
CREATE OR REPLACE FUNCTION add_eu_columns_if_not_exists()
RETURNS void AS $$
BEGIN
    -- Check and add columns to pesticide_products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_products' AND column_name = 'eu_approved') THEN
        ALTER TABLE pesticide_products ADD COLUMN eu_approved BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_products' AND column_name = 'eu_approval_date') THEN
        ALTER TABLE pesticide_products ADD COLUMN eu_approval_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_products' AND column_name = 'eu_expiry_date') THEN
        ALTER TABLE pesticide_products ADD COLUMN eu_expiry_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_products' AND column_name = 'eu_registration_number') THEN
        ALTER TABLE pesticide_products ADD COLUMN eu_registration_number VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_products' AND column_name = 'eu_member_states') THEN
        ALTER TABLE pesticide_products ADD COLUMN eu_member_states TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_products' AND column_name = 'eu_restrictions') THEN
        ALTER TABLE pesticide_products ADD COLUMN eu_restrictions TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_products' AND column_name = 'eu_hazard_classification') THEN
        ALTER TABLE pesticide_products ADD COLUMN eu_hazard_classification TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_products' AND column_name = 'eu_active_substance') THEN
        ALTER TABLE pesticide_products ADD COLUMN eu_active_substance VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_products' AND column_name = 'eu_last_updated') THEN
        ALTER TABLE pesticide_products ADD COLUMN eu_last_updated TIMESTAMP DEFAULT NOW();
    END IF;
    
    -- Check and add columns to pesticide_dosages
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_dosages' AND column_name = 'mrl_value') THEN
        ALTER TABLE pesticide_dosages ADD COLUMN mrl_value DECIMAL(10,4);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_dosages' AND column_name = 'mrl_unit') THEN
        ALTER TABLE pesticide_dosages ADD COLUMN mrl_unit VARCHAR(20) DEFAULT 'mg/kg';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_dosages' AND column_name = 'eu_compliant') THEN
        ALTER TABLE pesticide_dosages ADD COLUMN eu_compliant BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_dosages' AND column_name = 'eu_mrl_source') THEN
        ALTER TABLE pesticide_dosages ADD COLUMN eu_mrl_source VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'pesticide_dosages' AND column_name = 'eu_last_verified') THEN
        ALTER TABLE pesticide_dosages ADD COLUMN eu_last_verified TIMESTAMP DEFAULT NOW();
    END IF;
    
    -- Create indexes if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pesticide_products_eu_approved') THEN
        CREATE INDEX idx_pesticide_products_eu_approved 
        ON pesticide_products(eu_approved) WHERE eu_approved = true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pesticide_products_eu_expiry') THEN
        CREATE INDEX idx_pesticide_products_eu_expiry 
        ON pesticide_products(eu_expiry_date) WHERE eu_expiry_date IS NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pesticide_dosages_eu_compliant') THEN
        CREATE INDEX idx_pesticide_dosages_eu_compliant 
        ON pesticide_dosages(eu_compliant, crop) WHERE eu_compliant = true;
    END IF;
    
END;
$$ LANGUAGE plpgsql;

-- Create view for EU-approved pesticides with MRL data
CREATE OR REPLACE VIEW eu_approved_pesticides AS
SELECT 
    pp.id,
    pp.name,
    pp.active_ingredient,
    pp.eu_active_substance,
    pp.type,
    pp.eu_approval_date,
    pp.eu_expiry_date,
    pp.eu_registration_number,
    pp.eu_member_states,
    pp.eu_restrictions,
    pp.eu_hazard_classification,
    pp.safety_rating,
    pd.crop,
    pd.dosage_per_hectare,
    pd.dosage_unit,
    pd.mrl_value,
    pd.mrl_unit,
    pd.application_method,
    pd.preharvest_interval,
    pd.reentry_interval,
    pd.eu_compliant,
    CASE 
        WHEN pp.eu_expiry_date IS NULL THEN true
        WHEN pp.eu_expiry_date > CURRENT_DATE THEN true
        ELSE false
    END as is_currently_approved
FROM pesticide_products pp
LEFT JOIN pesticide_dosages pd ON pp.id = pd.pesticide_id
WHERE pp.eu_approved = true;

-- Create function to get EU-approved pesticides for crop
CREATE OR REPLACE FUNCTION get_eu_approved_for_crop(crop_name TEXT)
RETURNS TABLE (
    pesticide_id UUID,
    pesticide_name VARCHAR(255),
    active_ingredient VARCHAR(255),
    dosage_per_hectare DECIMAL(10,4),
    dosage_unit VARCHAR(20),
    mrl_value DECIMAL(10,4),
    mrl_unit VARCHAR(20),
    safety_rating INTEGER,
    restrictions TEXT[],
    expiry_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        eap.id,
        eap.name,
        eap.active_ingredient,
        eap.dosage_per_hectare,
        eap.dosage_unit,
        eap.mrl_value,
        eap.mrl_unit,
        eap.safety_rating,
        eap.eu_restrictions,
        eap.eu_expiry_date
    FROM eu_approved_pesticides eap
    WHERE eap.crop = crop_name 
    AND eap.is_currently_approved = true
    ORDER BY eap.safety_rating DESC, eap.mrl_value ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate EU compliance
CREATE OR REPLACE FUNCTION validate_eu_compliance(
    pesticide_name TEXT,
    crop_name TEXT,
    country_code TEXT DEFAULT 'EU'
)
RETURNS TABLE (
    approved BOOLEAN,
    mrl_compliant BOOLEAN,
    restrictions TEXT[],
    expiry_date DATE,
    hazard_codes TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.eu_approved AND (pp.eu_expiry_date IS NULL OR pp.eu_expiry_date > CURRENT_DATE),
        COALESCE(pd.eu_compliant, false),
        pp.eu_restrictions,
        pp.eu_expiry_date,
        pp.eu_hazard_classification
    FROM pesticide_products pp
    LEFT JOIN pesticide_dosages pd ON pp.id = pd.pesticide_id AND pd.crop = crop_name
    WHERE pp.name = pesticide_name;
END;
$$ LANGUAGE plpgsql;

-- Insert sample EU compliance data for testing
DO $$
BEGIN
    -- Update existing products with EU approval status
    UPDATE pesticide_products 
    SET 
        eu_approved = true,
        eu_approval_date = '2020-01-01',
        eu_expiry_date = '2030-12-31',
        eu_active_substance = active_ingredient,
        eu_member_states = ARRAY['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'DK', 'SE', 'FI'],
        eu_restrictions = ARRAY['Not for use near water bodies', 'Apply only during calm weather'],
        eu_hazard_classification = ARRAY['H302', 'H411']
    WHERE name IN ('Bordeaux Mixture', 'Mancozeb', 'Azoxystrobin', 'Tebuconazole');
    
    -- Update dosages with MRL data
    UPDATE pesticide_dosages 
    SET 
        mrl_value = 0.5,
        mrl_unit = 'mg/kg',
        eu_compliant = true,
        eu_mrl_source = 'EU Regulation 396/2005'
    WHERE pesticide_id IN (
        SELECT id FROM pesticide_products 
        WHERE name IN ('Bordeaux Mixture', 'Mancozeb', 'Azoxystrobin', 'Tebuconazole')
    );
    
END $$;

-- Grant necessary permissions
GRANT SELECT ON eu_approved_pesticides TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_eu_approved_for_crop(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION validate_eu_compliance(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION add_eu_columns_if_not_exists() TO anon, authenticated;

-- Create RLS policies for EU data
ALTER TABLE pesticide_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesticide_dosages ENABLE ROW LEVEL SECURITY;

-- Allow read access to EU pesticide data
CREATE POLICY "Allow read access to EU pesticide data" ON pesticide_products
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to EU dosage data" ON pesticide_dosages
    FOR SELECT USING (true);

-- Comments for documentation
COMMENT ON COLUMN pesticide_products.eu_approved IS 'Whether the pesticide is approved for use in the EU';
COMMENT ON COLUMN pesticide_products.eu_approval_date IS 'Date when EU approval was granted';
COMMENT ON COLUMN pesticide_products.eu_expiry_date IS 'Date when EU approval expires';
COMMENT ON COLUMN pesticide_products.eu_registration_number IS 'EU registration number for the pesticide';
COMMENT ON COLUMN pesticide_products.eu_member_states IS 'Array of EU member state codes where approved';
COMMENT ON COLUMN pesticide_products.eu_restrictions IS 'Array of EU-specific usage restrictions';
COMMENT ON COLUMN pesticide_products.eu_hazard_classification IS 'Array of EU hazard classification codes';

COMMENT ON COLUMN pesticide_dosages.mrl_value IS 'Maximum Residue Level value';
COMMENT ON COLUMN pesticide_dosages.mrl_unit IS 'Unit for MRL value (mg/kg, ppm, etc.)';
COMMENT ON COLUMN pesticide_dosages.eu_compliant IS 'Whether the dosage complies with EU MRL limits';
COMMENT ON COLUMN pesticide_dosages.eu_mrl_source IS 'Source regulation for the MRL value';

COMMENT ON VIEW eu_approved_pesticides IS 'View showing all EU-approved pesticides with their MRL data';
COMMENT ON FUNCTION get_eu_approved_for_crop(TEXT) IS 'Returns EU-approved pesticides for a specific crop';
COMMENT ON FUNCTION validate_eu_compliance(TEXT, TEXT, TEXT) IS 'Validates EU compliance for a pesticide-crop combination';
