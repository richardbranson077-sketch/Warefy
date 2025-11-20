'use client';

import { useState, useEffect } from 'react';
import { Map, Truck, Navigation, Clock } from 'lucide-react';
import { routes } from '@/lib/api';

export default function RoutesPage() {
    const [activeRoutes, setActiveRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                // In a real app, fetch all active routes
                // For demo, we'll use mock data if API returns empty
                const data = await routes.getByDriver(1); // Mock driver ID
                setActiveRoutes(data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching routes:', error);
                setLoading(false);
            }
        };

        fetchRoutes();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Route Optimization</h1>
                    <p className="text-gray-500 mt-1">Real-time delivery tracking and route optimization</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <Navigation className="h-5 w-5 mr-2" />
                    Optimize New Route
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Route List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-semibold text-gray-900">Active Vehicles</h3>

                    {[1, 2, 3].map((vehicle) => (
                        <div key={vehicle} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-primary-500 cursor-pointer transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <Truck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Vehicle VH-00{vehicle}</h4>
                                        <p className="text-xs text-gray-500">Driver: Mike D.</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                    In Transit
                                </span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Progress</span>
                                    <span>65%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className="bg-primary-500 h-1.5 rounded-full w-[65%]"></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 pt-1">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> ETA: 2:30 PM
                                    </span>
                                    <span>12/18 Stops</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Map View */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[600px] relative">
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                            <Map className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Interactive Map View</p>
                            <p className="text-sm text-gray-400 mt-1">Mapbox integration would render here</p>
                        </div>
                    </div>

                    {/* Overlay Stats */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs">
                        <h4 className="font-semibold text-gray-900 mb-2">Route Efficiency</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Distance</span>
                                <span className="font-medium">145.2 km</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Fuel Saved</span>
                                <span className="font-medium text-green-600">12.5 L</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Time Saved</span>
                                <span className="font-medium text-green-600">45 mins</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
