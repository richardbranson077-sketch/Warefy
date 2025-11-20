'use client';

import { useState } from 'react';
import { BrainCircuit, Lightbulb, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { aiRecommendations } from '../../lib/api';

export default function RecommendationsPage() {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('restocking');
    const [recommendations, setRecommendations] = useState([
        {
            id: 1,
            type: 'restocking',
            title: 'Restock Laptop SKU-001 Immediately',
            description: 'Inventory levels have dropped below 15 units. Based on current sales velocity of 5 units/day, stockout is predicted in 3 days.',
            impact: 'High Risk',
            confidence: 92,
            action: 'Order 50 units',
            reasoning: 'Sales velocity increased by 20% this week due to back-to-school promotion.'
        },
        {
            id: 2,
            type: 'supplier',
            title: 'Switch Supplier for Office Chairs',
            description: 'Current supplier lead time has increased to 14 days. Alternative Supplier B offers 7-day delivery at similar cost.',
            impact: 'Medium Impact',
            confidence: 85,
            action: 'Review Supplier B',
            reasoning: 'Consistent delays from current supplier affecting fulfillment metrics.'
        },
        {
            id: 3,
            type: 'contingency',
            title: 'Weather Alert: East Coast Route',
            description: 'Severe storm predicted for next 48 hours along I-95 corridor. Suggest rerouting via inland route.',
            impact: 'Critical',
            confidence: 88,
            action: 'Reroute Vehicles',
            reasoning: 'Weather API indicates 90% probability of heavy snow.'
        }
    ]);

    const generateRecommendation = async () => {
        setLoading(true);
        try {
            // In real app, call API
            // const data = await aiRecommendations.get({ context: activeTab });
            // setRecommendations(data.recommendations);

            // Simulate delay
            setTimeout(() => setLoading(false), 1500);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">AI Recommendations</h1>
                    <p className="text-gray-500 mt-1">Intelligent insights powered by GPT-4</p>
                </div>
                <button
                    onClick={generateRecommendation}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                    <BrainCircuit className={`h-5 w-5 mr-2 ${loading ? 'animate-pulse' : ''}`} />
                    Generate Insights
                </button>
            </div>

            <div className="flex gap-4 border-b border-gray-200 pb-1">
                {['restocking', 'supplier', 'contingency'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm capitalize border-b-2 transition-colors ${activeTab === tab
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab} Planning
                    </button>
                ))}
            </div>

            <div className="grid gap-6">
                {recommendations
                    .filter(r => activeTab === 'restocking' ? true : r.type === activeTab) // Simplified filter for demo
                    .map((rec) => (
                        <div key={rec.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${rec.impact === 'Critical' ? 'bg-red-100 text-red-600' :
                                                rec.impact === 'High Risk' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-blue-100 text-blue-600'
                                            }`}>
                                            <Lightbulb className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${rec.impact === 'Critical' ? 'bg-red-100 text-red-800' :
                                                        rec.impact === 'High Risk' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {rec.impact}
                                                </span>
                                                <span className="text-sm text-gray-500">Confidence: {rec.confidence}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <CheckCircle className="h-6 w-6" />
                                    </button>
                                </div>

                                <p className="text-gray-600 mb-4">{rec.description}</p>

                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <BrainCircuit className="h-4 w-4 text-purple-600" />
                                        AI Reasoning
                                    </h4>
                                    <p className="text-sm text-gray-600 italic">"{rec.reasoning}"</p>
                                </div>

                                <div className="flex justify-end">
                                    <button className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-700">
                                        Apply Recommendation <ArrowRight className="h-4 w-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
