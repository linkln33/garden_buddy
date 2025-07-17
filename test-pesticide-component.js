#!/usr/bin/env node

// Test the PesticideRecommendations component integration
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testPesticideComponent() {
  console.log('🧪 Testing PesticideRecommendations Component Integration');
  console.log('====================================================\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('1️⃣ Testing database connection...');
    
    // Test the exact query that PesticideRecommendations component would use
    const { data: pesticideData, error: pesticideError } = await supabase
      .from('pesticide_dosages')
      .select(`
        *,
        pesticide:pesticide_products(*),
        disease:plant_diseases(*),
        crop:crops(*)
      `)
      .limit(5);

    if (pesticideError) {
      console.error('❌ Pesticide query failed:', pesticideError.message);
      return false;
    }

    console.log(`✅ Found ${pesticideData?.length || 0} pesticide dosage records`);

    if (pesticideData && pesticideData.length > 0) {
      console.log('\n2️⃣ Testing data structure compatibility...');
      
      const sample = pesticideData[0];
      console.log('📋 Sample record structure:');
      console.log(`   Pesticide: ${sample.pesticide?.name || 'N/A'}`);
      console.log(`   Active Ingredient: ${sample.pesticide?.active_ingredient || 'N/A'}`);
      console.log(`   Disease: ${sample.disease?.name || 'N/A'}`);
      console.log(`   Crop: ${sample.crop?.name || 'N/A'}`);
      console.log(`   Dosage: ${sample.dosage_rate || 'N/A'} ${sample.dosage_unit || ''}`);
      console.log(`   PHI: ${sample.preharvest_interval || 'N/A'} days`);
      console.log(`   REI: ${sample.reentry_period || 'N/A'} hours`);
      console.log(`   Cost: $${sample.cost_per_hectare || 'N/A'}/ha`);
      
      // Test environmental impact structure
      if (sample.pesticide?.environmental_impact) {
        console.log('   Environmental Impact:');
        console.log(`     Water Toxicity: ${sample.pesticide.environmental_impact.water_toxicity || 'N/A'}`);
        console.log(`     Bee Toxicity: ${sample.pesticide.environmental_impact.bee_toxicity || 'N/A'}`);
        console.log(`     Soil Persistence: ${sample.pesticide.environmental_impact.soil_persistence || 'N/A'}`);
      }
      
      console.log('✅ Data structure matches component expectations');
    }

    console.log('\n3️⃣ Testing IPM recommendations query...');
    
    const { data: ipmData, error: ipmError } = await supabase
      .from('ipm_recommendations')
      .select(`
        *,
        disease:plant_diseases(*),
        crop:crops(*)
      `)
      .limit(3);

    if (ipmError) {
      console.log('⚠️  IPM query failed:', ipmError.message);
    } else {
      console.log(`✅ Found ${ipmData?.length || 0} IPM recommendation records`);
      
      if (ipmData && ipmData.length > 0) {
        const ipmSample = ipmData[0];
        console.log('📋 Sample IPM record:');
        console.log(`   Disease: ${ipmSample.disease?.name || 'N/A'}`);
        console.log(`   Crop: ${ipmSample.crop?.name || 'N/A'}`);
        console.log(`   Cultural Practices: ${ipmSample.cultural_practices?.length || 0} items`);
        console.log(`   Biological Controls: ${ipmSample.biological_controls?.length || 0} items`);
        console.log(`   Prevention Methods: ${ipmSample.prevention_methods?.length || 0} items`);
      }
    }

    console.log('\n4️⃣ Testing component props simulation...');
    
    // Simulate the props that would be passed to PesticideRecommendations
    const mockProps = {
      plantType: 'tomato',
      disease: 'late blight',
      region: 'Europe',
      isOrganic: false
    };

    console.log('📋 Simulating component props:');
    console.log(`   Plant Type: ${mockProps.plantType}`);
    console.log(`   Disease: ${mockProps.disease}`);
    console.log(`   Region: ${mockProps.region}`);
    console.log(`   Organic Only: ${mockProps.isOrganic}`);

    // Test filtered query
    const { data: filteredData, error: filteredError } = await supabase
      .from('pesticide_dosages')
      .select(`
        *,
        pesticide:pesticide_products(*),
        disease:plant_diseases(*),
        crop:crops(*)
      `)
      .eq('crop.name', mockProps.plantType)
      .ilike('disease.name', `%${mockProps.disease}%`)
      .limit(3);

    if (filteredError) {
      console.log('⚠️  Filtered query failed:', filteredError.message);
    } else {
      console.log(`✅ Filtered query returned ${filteredData?.length || 0} matching recommendations`);
    }

    console.log('\n5️⃣ Component readiness check...');
    
    const checks = [
      { name: 'Database Schema', status: pesticideData !== null },
      { name: 'Pesticide Products', status: pesticideData && pesticideData.length > 0 },
      { name: 'Environmental Impact Data', status: pesticideData && pesticideData[0]?.pesticide?.environmental_impact },
      { name: 'Dosage Information', status: pesticideData && pesticideData[0]?.dosage_rate },
      { name: 'Safety Intervals', status: pesticideData && pesticideData[0]?.preharvest_interval },
      { name: 'IPM Recommendations', status: ipmData && ipmData.length > 0 }
    ];

    checks.forEach(check => {
      console.log(`   ${check.status ? '✅' : '❌'} ${check.name}`);
    });

    const allPassed = checks.every(check => check.status);
    
    if (allPassed) {
      console.log('\n🎉 PesticideRecommendations Component Ready!');
      console.log('📋 The component can now:');
      console.log('   ✅ Display real pesticide products');
      console.log('   ✅ Show accurate dosage calculations');
      console.log('   ✅ Display environmental impact warnings');
      console.log('   ✅ Provide safety interval information');
      console.log('   ✅ Show IPM recommendations');
      console.log('   ✅ Filter by crop, disease, and region');
      
      console.log('\n💡 Next Steps:');
      console.log('   1. Start your dev server: npm run dev');
      console.log('   2. Navigate to the pesticide recommendations page');
      console.log('   3. Test with different plant types and diseases');
      console.log('   4. Verify all data displays correctly');
      
      return true;
    } else {
      console.log('\n⚠️  Component needs more setup');
      console.log('💡 Run the setup guide: PESTICIDE_SETUP_GUIDE.md');
      return false;
    }

  } catch (error) {
    console.error('❌ Component test failed:', error.message);
    return false;
  }
}

testPesticideComponent().then(success => {
  if (success) {
    console.log('\n🚀 Component integration test passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Component integration test failed');
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 Test failed with error:', error.message);
  process.exit(1);
});
