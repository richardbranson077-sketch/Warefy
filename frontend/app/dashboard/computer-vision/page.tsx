"use client";

import { Camera } from 'lucide-react';

export default function ComputerVisionPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
                <Camera className="h-8 w-8 text-indigo-600" />
                Computer Vision
            </h1>
            <p className="text-gray-700 mb-6">
                AI‑powered visual inspection, OCR, barcode scanning and safety monitoring.
                Future implementation will include live camera feed and TensorFlow.js models.
            </p>
            <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-500 italic">[Computer Vision UI will be built here.]</p>
            </div>
        </div>
    );
}
