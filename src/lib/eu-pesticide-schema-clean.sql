-- EU Pesticide Database Schema Extensions (Clean Version)
-- Handles existing triggers and constraints gracefully

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

-- Create indexes (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_pesticide_products_eu_approved 
ON pesticide_products(eu_approved) WHERE eu_approved = true;

CREATE INDEX IF NOT EXISTS idx_pesticide_products_eu_expiry 
ON pesticide_products(eu_expiry_date) WHERE eu_expiry_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pesticide_dosages_mrl 
ON pesticide_dosages(mrl_value) WHERE mrl_value IS NOT NULL;

-- Create EU approved pesticides view
CREATE OR REPLACE VIEW eu_approved_pesticides AS
SELECT 
    pp.id,
    pp.name,
    pp.active_ingredient,
    pp.eu_active_substance,
    pp.type,
    pp.safety_rating,
    pp.eu_approved,
    pp.eu_approval_date,
    pp.eu_expiry_date,
    pp.eu_registration_number,
    pp.eu_member_states,
    pp.eu_restrictions,
    pp.eu_hazard_classification,
    pd.crop,
    pd.dosage_per_hectare,
    pd.dosage_unit,
    pd.mrl_value,
    pd.mrl_unit,
    pd.eu_compliant,
    CASE 
        WHEN pp.eu_expiry_date IS NULL OR pp.eu_expiry_date > CURRENT_DATE 
        THEN true 
        ELSE false 
    END as is_currently_approved
FROM pesticide_products pp
LEFT JOIN pesticide_dosages pd ON pp.id = pd.pesticide_id
WHERE pp.eu_approved = true;

-- Create function to get EU approved pesticides for a crop
CREATE OR REPLACE FUNCTION get_eu_approved_for_crop(crop_name TEXT)
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    active_ingredient TEXT,
    dosage_per_hectare DECIMAL,
    dosage_unit TEXT,
    mrl_value DECIMAL,
    mrl_unit TEXT,
    safety_rating INTEGER,
    eu_restrictions TEXT[],
    eu_expiry_date DATE
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

-- Create trigger function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_eu_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.eu_last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to avoid conflicts
DROP TRIGGER IF EXISTS update_pesticide_eu_timestamp ON pesticide_products;
CREATE TRIGGER update_pesticide_eu_timestamp
    BEFORE UPDATE ON pesticide_products
    FOR EACH ROW
    EXECUTE FUNCTION update_eu_timestamp();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'EU Pesticide Database schema extensions applied successfully!';
    RAISE NOTICE 'New columns added to pesticide_products and pesticide_dosages tables';
    RAISE NOTICE 'Views and functions created for EU compliance checking';
END $$;
