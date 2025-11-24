import { useState, useEffect } from 'react';
import * as reorderService from '../services/reorder.service';
import { ReorderItem, ReorderSuggestion } from '../services/reorder.service';

export const useReorder = () => {
    const [items, setItems] = useState<ReorderItem[]>([]);
    const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await reorderService.getReorderItems();
            setItems(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const data = await reorderService.getReorderSuggestions();
            setSuggestions(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const createItem = async (item: Partial<ReorderItem>) => {
        setLoading(true);
        try {
            const newItem = await reorderService.createReorderItem(item);
            setItems(prev => [...prev, newItem]);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const updateItem = async (id: string, item: Partial<ReorderItem>) => {
        setLoading(true);
        try {
            const updated = await reorderService.updateReorderItem(id, item);
            setItems(prev => prev.map(i => (i.id === id ? updated : i)));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id: string) => {
        setLoading(true);
        try {
            await reorderService.deleteReorderItem(id);
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchSuggestions();
    }, []);

    return { items, suggestions, loading, error, fetchItems, fetchSuggestions, createItem, updateItem, deleteItem };
};
