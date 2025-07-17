import React, { useState, useEffect } from 'react';
import { 
  getPesticideRecommendationsByName,
  calculateSprayAmount,
  getAvailableRegions,
  PesticideDosage,
  IPMRecommendation
} from '../lib/supabase-pesticide';
import { searchAgrisCached } from '../lib/agris-api';

interface PesticideRecommendationsProps {
  diagnosis: string;
  plantType: string;
}

export default function PesticideRecommendations({ diagnosis, plantType }: PesticideRecommendationsProps) {
  const [dosages, setDosages] = useState<PesticideDosage[]>([]);
  const [ipmRecommendations, setIpmRecommendations] = useState<IPMRecommendation[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('EU');
  const [loading, setLoading] = useState(true);
  const [agrisLoading, setAgrisLoading] = useState(false);
  const [agrisResults, setAgrisResults] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'chemical' | 'ipm'>('ipm');
  const [sprayVolume, setSprayVolume] = useState<number>(100);
  const [fieldSize, setFieldSize] = useState<number>(1);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        
        // Load available regions
        const regions = await getAvailableRegions();
        setAvailableRegions(regions);
        
        // Load pesticide recommendations from Supabase
        const { dosages: pesticideData, ipmRecommendations: ipmData } = 
          await getPesticideRecommendationsByName(diagnosis, plantType, selectedRegion);
        
        setDosages(pesticideData);
        setIpmRecommendations(ipmData);
        
        // If no data found in Supabase, try AGRIS API as fallback
        if (pesticideData.length === 0 && ipmData.length === 0) {
          await searchAgrisForRecommendations();
        }
      } catch (error) {
        console.error('Error loading pesticide recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [diagnosis, plantType, selectedRegion]);
  
  const searchAgrisForRecommendations = async () => {
    try {
      setAgrisLoading(true);
      
      const results = await searchAgrisCached({
        query: `${diagnosis} ${plantType} pesticide treatment`,
        limit: 10
      });
      
      setAgrisResults(results.records);
    } catch (error) {
      console.error('Error searching AGRIS:', error);
    } finally {
      setAgrisLoading(false);
    }
  };

  const calculateDosage = (dosage: PesticideDosage) => {
    if (!dosage.dosage_rate) {
      return {
        totalAmount: 'Not specified',
        concentration: 'Not specified',
        sprayVolume: `${sprayVolume} L`
      };
    }
    
    const calculation = calculateSprayAmount(dosage.dosage_rate, fieldSize, sprayVolume);
    
    return {
      totalAmount: `${calculation.pesticideAmount.toFixed(2)} ${calculation.pesticideUnit}`,
      concentration: calculation.concentration,
      sprayVolume: `${calculation.totalSprayVolume} L`
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Loading treatment recommendations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        🌱 Treatment Recommendations for {diagnosis}
      </h3>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setSelectedTab('ipm')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'ipm'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🌿 Integrated Pest Management
        </button>
        <button
          onClick={() => setSelectedTab('chemical')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'chemical'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🧪 Chemical Control
        </button>
      </div>

      {/* IPM Recommendations Tab */}
      {selectedTab === 'ipm' && (
        <div className="space-y-4">
          {ipmRecommendations.length > 0 ? (
            ipmRecommendations.map((ipm, index) => (
              <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold text-green-800 mb-3">{ipm.disease?.name || 'Disease Treatment'}</h4>
                
                {/* Cultural Controls */}
                {ipm.cultural_practices && ipm.cultural_practices.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-green-700 mb-2">🌾 Cultural Controls:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {ipm.cultural_practices.map((control: string, idx: number) => (
                        <li key={idx} className="text-green-600 text-sm">{control}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Biological Controls */}
                {ipm.biological_controls && ipm.biological_controls.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-green-700 mb-2">🐛 Biological Controls:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {ipm.biological_controls.map((control: string, idx: number) => (
                        <li key={idx} className="text-green-600 text-sm">{control}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prevention Methods */}
                {ipm.prevention_methods && ipm.prevention_methods.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-green-700 mb-2">⚗️ Prevention Methods:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {ipm.prevention_methods.map((control: string, idx: number) => (
                        <li key={idx} className="text-green-600 text-sm">{control}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Monitoring */}
                {ipm.monitoring_methods && ipm.monitoring_methods.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-green-700 mb-2">📊 Monitoring Methods:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {ipm.monitoring_methods.map((method: string, idx: number) => (
                        <li key={idx} className="text-green-600 text-sm">{method}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No IPM recommendations available for this diagnosis.</p>
            </div>
          )}
        </div>
      )}

      {/* Chemical Control Tab */}
      {selectedTab === 'chemical' && (
        <div className="space-y-6">
          {/* Spray Calculator */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">📊 Spray Volume Calculator</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Field Size (hectares)
                </label>
                <input
                  type="number"
                  value={fieldSize}
                  onChange={(e) => setFieldSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0.1"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Spray Volume (L/ha)
                </label>
                <input
                  type="number"
                  value={sprayVolume}
                  onChange={(e) => setSprayVolume(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="50"
                  step="10"
                />
              </div>
            </div>
          </div>

          {/* Pesticide Dosages */}
          <div className="space-y-4">
            {dosages.length > 0 ? (
              dosages.map((dosage, index) => {
                const calculatedDosage = calculateDosage(dosage);
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{dosage.pesticide?.name || 'Pesticide Product'}</h4>
                        <p className="text-sm text-gray-600">{dosage.pesticide?.active_ingredient || 'Active ingredient not specified'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        dosage.pesticide?.eu_approved 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {dosage.pesticide?.eu_approved ? 'EU Approved' : 'Check Registration'}
                      </span>
                    </div>

                    {/* Application Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Application Rate:</span>
                          <span className="text-sm font-medium">{dosage.dosage_rate} {dosage.dosage_unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Amount Needed:</span>
                          <span className="text-sm font-medium text-blue-600">{calculatedDosage.totalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Concentration:</span>
                          <span className="text-sm font-medium text-blue-600">{calculatedDosage.concentration}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">PHI:</span>
                          <span className="text-sm font-medium">{dosage.preharvest_interval || 'Not specified'} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">REI:</span>
                          <span className="text-sm font-medium">{dosage.reentry_period || 'Not specified'} hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Cost/ha:</span>
                          <span className="text-sm font-medium">${dosage.cost_per_hectare || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Environmental Impact */}
                    {dosage.pesticide?.environmental_impact && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2">🌍 Environmental Impact:</h5>
                        <div className="flex flex-wrap gap-2">
                          {dosage.pesticide.environmental_impact.bee_toxicity && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              dosage.pesticide.environmental_impact.bee_toxicity === 'low' ? 'bg-green-100 text-green-700' :
                              dosage.pesticide.environmental_impact.bee_toxicity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              🐝 Bee Risk: {dosage.pesticide.environmental_impact.bee_toxicity}
                            </span>
                          )}
                          {dosage.pesticide.environmental_impact.water_toxicity && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              dosage.pesticide.environmental_impact.water_toxicity === 'low' ? 'bg-green-100 text-green-700' :
                              dosage.pesticide.environmental_impact.water_toxicity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              🐟 Water: {dosage.pesticide.environmental_impact.water_toxicity}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Application Instructions */}
                    {(dosage.application_method || dosage.application_timing) && (
                      <div className="bg-gray-50 rounded p-3">
                        <h5 className="font-medium text-gray-700 mb-1">📋 Application Instructions:</h5>
                        {dosage.application_method && (
                          <p className="text-sm text-gray-600 mb-1"><strong>Method:</strong> {dosage.application_method}</p>
                        )}
                        {dosage.application_timing && (
                          <p className="text-sm text-gray-600"><strong>Timing:</strong> {dosage.application_timing}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No chemical control options available for this diagnosis.</p>
                <p className="text-sm mt-2">Consider using IPM approaches instead.</p>
              </div>
            )}
          </div>

          {/* Safety Warning */}
          {dosages.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">⚠️ Safety Reminders</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Always read and follow label instructions</li>
                <li>• Wear appropriate personal protective equipment (PPE)</li>
                <li>• Respect pre-harvest intervals (PHI) and re-entry intervals (REI)</li>
                <li>• Consider environmental conditions before application</li>
                <li>• Rotate active ingredients to prevent resistance</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
