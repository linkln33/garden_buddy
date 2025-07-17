-- Supabase SQL Schema for Real Pesticide Database
-- Run this in Supabase SQL Editor to create tables for real pesticide data

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- 1. Pesticide Products Table
CREATE TABLE IF NOT EXISTS pesticide_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active_ingredient VARCHAR(255) NOT NULL,
    brand_names TEXT[], -- Array of brand names
    product_type VARCHAR(50) NOT NULL, -- 'fungicide', 'insecticide', 'herbicide'
    manufacturer VARCHAR(255),
    registration_number VARCHAR(100),
    eu_approved BOOLEAN DEFAULT false,
    countries_approved TEXT[], -- Array of country codes
    toxicity_class VARCHAR(20), -- 'I', 'II', 'III', 'IV' or 'Low', 'Medium', 'High'
    environmental_impact JSONB, -- JSON with water, soil, bee toxicity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crops Table
CREATE TABLE IF NOT EXISTS crops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    scientific_name VARCHAR(255),
    category VARCHAR(100), -- 'vegetable', 'fruit', 'cereal', 'ornamental'
    growth_stages TEXT[], -- Array of growth stages
    common_diseases TEXT[], -- Array of common disease names
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Plant Diseases Table (enhanced from existing)
CREATE TABLE IF NOT EXISTS plant_diseases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    disease_type VARCHAR(50), -- 'fungal', 'bacterial', 'viral', 'pest'
    affected_crops TEXT[], -- Array of crop names
    symptoms TEXT NOT NULL,
    causes TEXT,
    conditions JSONB, -- JSON with temperature, humidity, season conditions
    severity_levels TEXT[], -- 'low', 'medium', 'high', 'critical'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Pesticide Dosages Table (main treatment data)
CREATE TABLE IF NOT EXISTS pesticide_dosages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pesticide_id UUID REFERENCES pesticide_products(id) ON DELETE CASCADE,
    disease_id UUID REFERENCES plant_diseases(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    dosage_rate VARCHAR(50) NOT NULL, -- e.g., '2.5 kg/ha', '3 ml/L'
    dosage_unit VARCHAR(20) NOT NULL, -- 'kg/ha', 'g/L', 'ml/L'
    application_method VARCHAR(100), -- 'foliar spray', 'soil drench', 'seed treatment'
    application_timing VARCHAR(255), -- 'early morning', 'before flowering'
    frequency VARCHAR(100), -- 'once', 'weekly', '14 days interval'
    max_applications INTEGER, -- Maximum number of applications per season
    preharvest_interval INTEGER, -- Days before harvest (PHI)
    reentry_period INTEGER, -- Hours before field reentry
    water_volume VARCHAR(50), -- Water volume for mixing (e.g., '200-400 L/ha')
    efficacy_rating DECIMAL(3,2), -- 0.00 to 5.00 rating
    cost_per_hectare DECIMAL(10,2), -- Cost in local currency
    region VARCHAR(100), -- 'EU', 'Romania', 'Greece', 'Turkey', etc.
    source VARCHAR(255), -- Data source (EU DB, AGRIS, etc.)
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination per region
    UNIQUE(pesticide_id, disease_id, crop_id, region)
);

-- 5. IPM Recommendations Table
CREATE TABLE IF NOT EXISTS ipm_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    disease_id UUID REFERENCES plant_diseases(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    prevention_methods TEXT[], -- Array of prevention methods
    biological_controls TEXT[], -- Array of biological control options
    cultural_practices TEXT[], -- Array of cultural practices
    monitoring_methods TEXT[], -- How to monitor for the disease
    threshold_levels JSONB, -- JSON with economic thresholds
    seasonal_timing TEXT[], -- Best timing for interventions
    effectiveness_rating DECIMAL(3,2), -- 0.00 to 5.00
    cost_effectiveness VARCHAR(20), -- 'low', 'medium', 'high'
    region VARCHAR(100),
    source VARCHAR(255),
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination per region
    UNIQUE(disease_id, crop_id, region)
);

-- 6. AGRIS Records Table (cache AGRIS API responses)
CREATE TABLE IF NOT EXISTS agris_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agris_id VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT,
    authors TEXT[],
    subjects TEXT[],
    keywords TEXT[],
    language VARCHAR(10),
    country VARCHAR(100),
    publication_year INTEGER,
    url TEXT,
    extracted_pesticides TEXT[], -- Extracted pesticide names
    extracted_dosages TEXT[], -- Extracted dosage information
    extracted_methods TEXT[], -- Extracted application methods
    relevance_score DECIMAL(3,2), -- Calculated relevance (0.00 to 1.00)
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Data Sources Tracking Table
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    url TEXT NOT NULL,
    description TEXT,
    api_available BOOLEAN DEFAULT false,
    last_updated TIMESTAMP WITH TIME ZONE,
    update_frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'yearly'
    data_quality_rating DECIMAL(3,2), -- 0.00 to 5.00
    coverage_regions TEXT[], -- Array of regions covered
    record_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'deprecated'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pesticide_dosages_disease ON pesticide_dosages(disease_id);
CREATE INDEX IF NOT EXISTS idx_pesticide_dosages_crop ON pesticide_dosages(crop_id);
CREATE INDEX IF NOT EXISTS idx_pesticide_dosages_region ON pesticide_dosages(region);
CREATE INDEX IF NOT EXISTS idx_pesticide_products_type ON pesticide_products(product_type);
CREATE INDEX IF NOT EXISTS idx_plant_diseases_type ON plant_diseases(disease_type);
CREATE INDEX IF NOT EXISTS idx_agris_records_country ON agris_records(country);
CREATE INDEX IF NOT EXISTS idx_agris_records_year ON agris_records(publication_year);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_pesticide_products_search ON pesticide_products 
    USING gin(to_tsvector('english', name || ' ' || active_ingredient));
CREATE INDEX IF NOT EXISTS idx_plant_diseases_search ON plant_diseases 
    USING gin(to_tsvector('english', name || ' ' || symptoms));
CREATE INDEX IF NOT EXISTS idx_agris_records_search ON agris_records 
    USING gin(to_tsvector('english', title || ' ' || COALESCE(abstract, '')));

-- Row Level Security Policies
ALTER TABLE pesticide_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesticide_dosages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipm_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agris_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to pesticide data" ON pesticide_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to crops" ON crops FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to diseases" ON plant_diseases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to dosages" ON pesticide_dosages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to ipm" ON ipm_recommendations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to agris" ON agris_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to sources" ON data_sources FOR SELECT TO authenticated USING (true);

-- Allow admin users to insert/update data (you can modify this based on your user roles)
CREATE POLICY "Allow admin insert on pesticide data" ON pesticide_products FOR INSERT TO authenticated 
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin update on pesticide data" ON pesticide_products FOR UPDATE TO authenticated 
    USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Add INSERT/UPDATE policies for all tables
CREATE POLICY "Allow admin insert crops" ON crops FOR INSERT TO authenticated 
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin insert diseases" ON plant_diseases FOR INSERT TO authenticated 
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin insert dosages" ON pesticide_dosages FOR INSERT TO authenticated 
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin insert ipm" ON ipm_recommendations FOR INSERT TO authenticated 
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin insert agris" ON agris_records FOR INSERT TO authenticated 
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Allow admin insert sources" ON data_sources FOR INSERT TO authenticated 
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Insert initial data sources
INSERT INTO data_sources (name, url, description, api_available, coverage_regions, data_quality_rating) VALUES
('EU Pesticide Database', 'https://ec.europa.eu/food/plant/pesticides/eu-pesticides-database/', 'Official EU pesticide registration database', false, ARRAY['EU'], 5.00),
('AGRIS FAO', 'https://agris.fao.org/', 'International agricultural research database', true, ARRAY['Global'], 4.50),
('PPDB Hertfordshire', 'https://sitem.herts.ac.uk/aeru/ppdb/', 'Pesticide Properties Database', false, ARRAY['Global'], 4.80),
('OpenFoodTox EFSA', 'https://www.efsa.europa.eu/en/data-report/chemical-hazards-database', 'Chemical hazards and toxicology database', false, ARRAY['EU'], 4.90),
('AKIS Romania', 'https://akis.gov.ro/', 'Romanian agricultural knowledge system', false, ARRAY['Romania'], 4.00),
('Benaki Institute Greece', 'https://www.bpi.gr/en/', 'Greek phytopathological institute', false, ARRAY['Greece'], 4.20),
('TÜRKVET Turkey', 'https://www.tarimorman.gov.tr/', 'Turkish veterinary and pesticide registry', false, ARRAY['Turkey'], 3.80)
ON CONFLICT (name) DO NOTHING;

-- Insert some initial crops
INSERT INTO crops (name, scientific_name, category, common_diseases) VALUES
('Tomato', 'Solanum lycopersicum', 'vegetable', ARRAY['Early Blight', 'Late Blight', 'Bacterial Spot', 'Fusarium Wilt']),
('Grape', 'Vitis vinifera', 'fruit', ARRAY['Powdery Mildew', 'Downy Mildew', 'Black Rot', 'Botrytis']),
('Wheat', 'Triticum aestivum', 'cereal', ARRAY['Rust', 'Septoria', 'Powdery Mildew', 'Fusarium Head Blight']),
('Potato', 'Solanum tuberosum', 'vegetable', ARRAY['Late Blight', 'Early Blight', 'Blackleg', 'Common Scab']),
('Apple', 'Malus domestica', 'fruit', ARRAY['Apple Scab', 'Fire Blight', 'Powdery Mildew', 'Cedar Apple Rust']),
('Cucumber', 'Cucumis sativus', 'vegetable', ARRAY['Downy Mildew', 'Powdery Mildew', 'Bacterial Wilt', 'Anthracnose'])
ON CONFLICT (name) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_pesticide_products_updated_at BEFORE UPDATE ON pesticide_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pesticide_dosages_updated_at BEFORE UPDATE ON pesticide_dosages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
