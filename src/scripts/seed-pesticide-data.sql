-- Seed data for pesticide database with real information
-- Based on EU Pesticide Database and PPDB data

-- Insert real pesticide products (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pesticide_products LIMIT 1) THEN
        INSERT INTO pesticide_products (name, active_ingredient, product_type, manufacturer, eu_approved, toxicity_class, environmental_impact) VALUES
        -- Fungicides
        ('Bordeaux Mixture', 'Copper sulfate', 'fungicide', 'Various', true, 'III', '{"water_toxicity": "medium", "bee_toxicity": "low", "soil_persistence": "high"}'),
        ('Mancozeb WP', 'Mancozeb', 'fungicide', 'Dow AgroSciences', true, 'III', '{"water_toxicity": "low", "bee_toxicity": "low", "soil_persistence": "medium"}'),
        ('Azoxystrobin SC', 'Azoxystrobin', 'fungicide', 'Syngenta', true, 'III', '{"water_toxicity": "high", "bee_toxicity": "medium", "soil_persistence": "medium"}'),
        ('Tebuconazole EC', 'Tebuconazole', 'fungicide', 'Bayer', true, 'III', '{"water_toxicity": "medium", "bee_toxicity": "low", "soil_persistence": "high"}'),
        ('Propiconazole EC', 'Propiconazole', 'fungicide', 'Syngenta', true, 'III', '{"water_toxicity": "medium", "bee_toxicity": "medium", "soil_persistence": "high"}'),
        
        -- Insecticides  
        ('Imidacloprid SL', 'Imidacloprid', 'insecticide', 'Bayer', true, 'II', '{"water_toxicity": "medium", "bee_toxicity": "high", "soil_persistence": "high"}'),
        ('Lambda-cyhalothrin EC', 'Lambda-cyhalothrin', 'insecticide', 'Syngenta', true, 'II', '{"water_toxicity": "high", "bee_toxicity": "high", "soil_persistence": "medium"}'),
        ('Spinosad SC', 'Spinosad', 'insecticide', 'Dow AgroSciences', true, 'III', '{"water_toxicity": "low", "bee_toxicity": "medium", "soil_persistence": "low"}'),
        ('Bacillus thuringiensis WP', 'Bacillus thuringiensis', 'insecticide', 'Various', true, 'IV', '{"water_toxicity": "low", "bee_toxicity": "low", "soil_persistence": "low"}'),
        
        -- Herbicides
        ('Glyphosate SL', 'Glyphosate', 'herbicide', 'Monsanto', true, 'III', '{"water_toxicity": "medium", "bee_toxicity": "low", "soil_persistence": "medium"}'),
        ('2,4-D Amine', '2,4-D', 'herbicide', 'Dow AgroSciences', true, 'II', '{"water_toxicity": "medium", "bee_toxicity": "low", "soil_persistence": "medium"}'),
        ('Atrazine WP', 'Atrazine', 'herbicide', 'Syngenta', false, 'III', '{"water_toxicity": "high", "bee_toxicity": "low", "soil_persistence": "high"}');
    END IF;
END $$;

-- Insert crops (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM crops LIMIT 1) THEN
        INSERT INTO crops (name, scientific_name, category, common_diseases) VALUES
        ('Tomato', 'Solanum lycopersicum', 'vegetable', ARRAY['late blight', 'early blight', 'bacterial spot', 'fusarium wilt']),
        ('Potato', 'Solanum tuberosum', 'vegetable', ARRAY['late blight', 'early blight', 'black scurf', 'common scab']),
        ('Grape', 'Vitis vinifera', 'fruit', ARRAY['powdery mildew', 'downy mildew', 'botrytis', 'black rot']),
        ('Wheat', 'Triticum aestivum', 'cereal', ARRAY['rust', 'septoria', 'powdery mildew', 'fusarium head blight']),
        ('Apple', 'Malus domestica', 'fruit', ARRAY['apple scab', 'fire blight', 'powdery mildew', 'cedar apple rust']),
        ('Corn', 'Zea mays', 'cereal', ARRAY['corn borer', 'gray leaf spot', 'northern corn leaf blight']),
        ('Cucumber', 'Cucumis sativus', 'vegetable', ARRAY['downy mildew', 'powdery mildew', 'bacterial wilt']),
        ('Pepper', 'Capsicum annuum', 'vegetable', ARRAY['bacterial spot', 'anthracnose', 'phytophthora blight']);
    END IF;
END $$;

-- Insert plant diseases (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM plant_diseases LIMIT 1) THEN
        INSERT INTO plant_diseases (name, scientific_name, disease_type, affected_crops, symptoms, causes, conditions) VALUES
        ('Late Blight', 'Phytophthora infestans', 'fungal', ARRAY['tomato', 'potato'], 'Dark brown lesions on leaves, white mold on undersides, rapid plant death', 'Phytophthora infestans fungus', '{"temperature": "15-25°C", "humidity": ">90%", "season": "cool, wet weather"}'),
        ('Early Blight', 'Alternaria solani', 'fungal', ARRAY['tomato', 'potato'], 'Concentric ring spots on leaves, yellowing, defoliation', 'Alternaria solani fungus', '{"temperature": "24-29°C", "humidity": "90%+", "season": "warm, humid weather"}'),
        ('Powdery Mildew', 'Erysiphe necator', 'fungal', ARRAY['grape', 'apple', 'cucumber'], 'White powdery coating on leaves and fruit', 'Various Erysiphe species', '{"temperature": "20-27°C", "humidity": "40-70%", "season": "dry, warm weather"}'),
        ('Downy Mildew', 'Plasmopara viticola', 'fungal', ARRAY['grape', 'cucumber'], 'Yellow spots on upper leaf surface, white downy growth underneath', 'Plasmopara species', '{"temperature": "20-25°C", "humidity": ">95%", "season": "cool, wet weather"}'),
        ('Apple Scab', 'Venturia inaequalis', 'fungal', ARRAY['apple'], 'Dark, scabby lesions on leaves and fruit', 'Venturia inaequalis fungus', '{"temperature": "16-24°C", "humidity": ">95%", "season": "spring, wet weather"}'),
        ('Rust', 'Puccinia species', 'fungal', ARRAY['wheat'], 'Orange-red pustules on leaves and stems', 'Puccinia species fungi', '{"temperature": "15-22°C", "humidity": ">95%", "season": "cool, moist weather"}');
    END IF;
END $$;

-- Insert pesticide dosages (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pesticide_dosages LIMIT 1) THEN
        INSERT INTO pesticide_dosages (pesticide_id, disease_id, crop_id, dosage_rate, dosage_unit, application_method, application_timing, preharvest_interval, reentry_period, cost_per_hectare) VALUES
        -- Late Blight treatments
        ((SELECT id FROM pesticide_products WHERE name = 'Bordeaux Mixture'), (SELECT id FROM plant_diseases WHERE name = 'Late Blight'), (SELECT id FROM crops WHERE name = 'Tomato'), '2.5', 'kg/ha', 'Foliar spray', 'Preventive, every 7-10 days', 7, 24, 45.00),
        ((SELECT id FROM pesticide_products WHERE name = 'Mancozeb WP'), (SELECT id FROM plant_diseases WHERE name = 'Late Blight'), (SELECT id FROM crops WHERE name = 'Tomato'), '2.0', 'kg/ha', 'Foliar spray', 'Preventive, every 7-14 days', 14, 24, 35.00),
        ((SELECT id FROM pesticide_products WHERE name = 'Azoxystrobin SC'), (SELECT id FROM plant_diseases WHERE name = 'Late Blight'), (SELECT id FROM crops WHERE name = 'Tomato'), '0.5', 'L/ha', 'Foliar spray', 'At first symptoms', 3, 12, 85.00),
        
        -- Early Blight treatments
        ((SELECT id FROM pesticide_products WHERE name = 'Mancozeb WP'), (SELECT id FROM plant_diseases WHERE name = 'Early Blight'), (SELECT id FROM crops WHERE name = 'Tomato'), '2.0', 'kg/ha', 'Foliar spray', 'Preventive, every 10-14 days', 14, 24, 35.00),
        ((SELECT id FROM pesticide_products WHERE name = 'Tebuconazole EC'), (SELECT id FROM plant_diseases WHERE name = 'Early Blight'), (SELECT id FROM crops WHERE name = 'Tomato'), '0.5', 'L/ha', 'Foliar spray', 'At first symptoms', 21, 12, 65.00),
        
        -- Powdery Mildew treatments
        ((SELECT id FROM pesticide_products WHERE name = 'Azoxystrobin SC'), (SELECT id FROM plant_diseases WHERE name = 'Powdery Mildew'), (SELECT id FROM crops WHERE name = 'Grape'), '0.3', 'L/ha', 'Foliar spray', 'Preventive, pre-bloom', 21, 12, 85.00),
        ((SELECT id FROM pesticide_products WHERE name = 'Propiconazole EC'), (SELECT id FROM plant_diseases WHERE name = 'Powdery Mildew'), (SELECT id FROM crops WHERE name = 'Grape'), '0.4', 'L/ha', 'Foliar spray', 'At first symptoms', 28, 12, 75.00),
        
        -- Apple Scab treatments
        ((SELECT id FROM pesticide_products WHERE name = 'Mancozeb WP'), (SELECT id FROM plant_diseases WHERE name = 'Apple Scab'), (SELECT id FROM crops WHERE name = 'Apple'), '2.5', 'kg/ha', 'Foliar spray', 'Green tip to petal fall', 77, 24, 35.00),
        ((SELECT id FROM pesticide_products WHERE name = 'Tebuconazole EC'), (SELECT id FROM plant_diseases WHERE name = 'Apple Scab'), (SELECT id FROM crops WHERE name = 'Apple'), '0.6', 'L/ha', 'Foliar spray', 'Pre-bloom to post-bloom', 35, 12, 65.00);
    END IF;
END $$;

-- Insert IPM recommendations (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM ipm_recommendations LIMIT 1) THEN
        INSERT INTO ipm_recommendations (disease_id, crop_id, cultural_practices, biological_controls, prevention_methods, monitoring_methods, region) VALUES
        -- Late Blight IPM
        ((SELECT id FROM plant_diseases WHERE name = 'Late Blight'), (SELECT id FROM crops WHERE name = 'Tomato'), 
         ARRAY['Proper spacing for air circulation', 'Avoid overhead irrigation', 'Remove infected plant debris', 'Crop rotation'], 
         ARRAY['Bacillus subtilis', 'Trichoderma harzianum'], 
         ARRAY['Use resistant varieties', 'Copper-based fungicides', 'Improve drainage'], 
         ARRAY['Weather monitoring', 'Disease forecasting models', 'Weekly field scouting'], 
         'Europe'),
        
        -- Powdery Mildew IPM
        ((SELECT id FROM plant_diseases WHERE name = 'Powdery Mildew'), (SELECT id FROM crops WHERE name = 'Grape'), 
         ARRAY['Proper pruning for air circulation', 'Avoid excessive nitrogen', 'Remove infected shoots'], 
         ARRAY['Bacillus pumilus', 'Potassium bicarbonate'], 
         ARRAY['Sulfur applications', 'Resistant rootstocks', 'Canopy management'], 
         ARRAY['Visual inspection', 'Spore traps', 'Weather monitoring'], 
         'Europe'),
        
        -- Apple Scab IPM
        ((SELECT id FROM plant_diseases WHERE name = 'Apple Scab'), (SELECT id FROM crops WHERE name = 'Apple'), 
         ARRAY['Rake and destroy fallen leaves', 'Proper pruning', 'Avoid overhead irrigation'], 
         ARRAY['Bacillus subtilis', 'Urea applications to leaves'], 
         ARRAY['Resistant varieties', 'Copper fungicides', 'Lime sulfur'], 
         ARRAY['Ascospore maturity models', 'Weather monitoring', 'Leaf wetness sensors'], 
         'Europe');
    END IF;
END $$;

-- Insert data sources (only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM data_sources LIMIT 1) THEN
        INSERT INTO data_sources (name, url, description, api_available, coverage_regions, data_quality_rating) VALUES
        ('EU Pesticide Database', 'https://ec.europa.eu/food/plant/pesticides/eu-pesticides-database/', 'Official EU pesticide registration database', false, ARRAY['EU'], 5.00),
        ('PPDB Hertfordshire', 'https://sitem.herts.ac.uk/aeru/ppdb/', 'Pesticide Properties Database', false, ARRAY['Global'], 4.80),
        ('AGRIS FAO', 'https://agris.fao.org/', 'International agricultural research database', true, ARRAY['Global'], 4.50),
        ('Garden Buddy Curated', 'https://garden-buddy.com', 'Curated pesticide and IPM database', false, ARRAY['Europe', 'North America'], 4.70);
    END IF;
END $$;
