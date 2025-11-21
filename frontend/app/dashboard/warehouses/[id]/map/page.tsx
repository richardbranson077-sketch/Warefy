'use client';

import { useEffect, useState } from 'react';
import { warehouses } from '@/lib/api';
import { Save, Map, Box, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const GRID_SIZE = 20;
const CELL_TYPES = {
    EMPTY: 0,
    SHELF: 1,
    AISLE: 2,
    ZONE: 3,
    WALL: 4
};

const COLORS = {
    [CELL_TYPES.EMPTY]: 'bg-gray-800',
    [CELL_TYPES.SHELF]: 'bg-blue-600',
    [CELL_TYPES.AISLE]: 'bg-gray-700',
    [CELL_TYPES.ZONE]: 'bg-green-600/50',
    [CELL_TYPES.WALL]: 'bg-gray-600'
};

export default function WarehouseMapEditor({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [grid, setGrid] = useState<number[][]>(
        Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(CELL_TYPES.EMPTY))
    );
    const [selectedTool, setSelectedTool] = useState(CELL_TYPES.SHELF);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLayout();
    }, []);

    const fetchLayout = async () => {
        try {
            const data = await warehouses.getById(parseInt(params.id));
            if (data.layout_config) {
                setGrid(JSON.parse(data.layout_config));
            }
        } catch (error) {
            console.error('Failed to fetch warehouse layout:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = (row: number, col: number) => {
        const newGrid = [...grid];
        newGrid[row][col] = selectedTool;
        setGrid(newGrid);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await warehouses.updateLayout(parseInt(params.id), grid);
            alert('Layout saved successfully!');
        } catch (error) {
            console.error('Failed to save layout:', error);
            alert('Failed to save layout.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6 text-gray-400">Loading editor...</div>;

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-100 flex flex-col h-screen">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg transition text-white">
                        &larr; Back
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Map className="h-6 w-6 text-blue-400" />
                            Warehouse Map Editor
                        </h1>
                        <p className="text-gray-400 text-sm">Design your warehouse layout</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Layout'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Toolbar */}
                <div className="w-64 bg-gray-800 rounded-xl border border-gray-700 p-4 flex flex-col gap-2">
                    <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Tools</h3>

                    <button
                        onClick={() => setSelectedTool(CELL_TYPES.SHELF)}
                        className={`p-3 rounded-lg flex items-center gap-3 transition ${selectedTool === CELL_TYPES.SHELF ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        <Box className="h-5 w-5" /> Shelf
                    </button>

                    <button
                        onClick={() => setSelectedTool(CELL_TYPES.AISLE)}
                        className={`p-3 rounded-lg flex items-center gap-3 transition ${selectedTool === CELL_TYPES.AISLE ? 'bg-gray-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        <div className="h-5 w-5 border-2 border-dashed border-current rounded" /> Aisle
                    </button>

                    <button
                        onClick={() => setSelectedTool(CELL_TYPES.ZONE)}
                        className={`p-3 rounded-lg flex items-center gap-3 transition ${selectedTool === CELL_TYPES.ZONE ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        <div className="h-5 w-5 bg-green-500/50 rounded" /> Zone
                    </button>

                    <button
                        onClick={() => setSelectedTool(CELL_TYPES.WALL)}
                        className={`p-3 rounded-lg flex items-center gap-3 transition ${selectedTool === CELL_TYPES.WALL ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        <div className="h-5 w-5 bg-gray-400 rounded-sm" /> Wall
                    </button>

                    <button
                        onClick={() => setSelectedTool(CELL_TYPES.EMPTY)}
                        className={`p-3 rounded-lg flex items-center gap-3 transition ${selectedTool === CELL_TYPES.EMPTY ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        <X className="h-5 w-5" /> Eraser
                    </button>

                    <div className="mt-auto p-4 bg-gray-900/50 rounded-lg text-xs text-gray-500">
                        Click on the grid to place the selected element. Drag to paint (coming soon).
                    </div>
                </div>

                {/* Grid Canvas */}
                <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 p-8 overflow-auto flex items-center justify-center">
                    <div
                        className="grid gap-1 bg-gray-900 p-1 rounded border border-gray-700 shadow-2xl"
                        style={{
                            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(20px, 1fr))`,
                            width: 'fit-content'
                        }}
                    >
                        {grid.map((row, rowIndex) => (
                            row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                    className={`w-8 h-8 rounded-sm cursor-pointer transition hover:opacity-80 ${COLORS[cell]}`}
                                    title={`Row: ${rowIndex}, Col: ${colIndex}`}
                                />
                            ))
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
