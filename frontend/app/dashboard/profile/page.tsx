'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Shield, Phone, MapPin, Camera, Save, Loader2 } from 'lucide-react';
import { usersService } from '../../../services/users.service';
import Image from 'next/image';

export default function ProfilePage() {
    const [user, setUser] = useState({
        id: 0,
        name: '',
        email: '',
        role: '',
        phone: '',
        location: '',
        bio: '',
        avatar_url: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await usersService.getMe();
            setUser({
                id: data.id,
                name: data.fullName || data.full_name || '',
                email: data.email || '',
                role: data.role || '',
                phone: data.phone || '',
                location: data.location || '',
                bio: data.bio || '',
                avatar_url: data.avatarUrl || data.avatar_url || ''
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await usersService.updateMe({
                full_name: user.name,
                phone: user.phone,
                bio: user.bio,
                location: user.location
            });
            setIsEditing(false);
            // Optionally show success message
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        try {
            setUploading(true);
            const data = await usersService.uploadAvatar(file);
            setUser(prev => ({
                ...prev,
                avatar_url: data.avatarUrl || data.avatar_url || ''
            }));
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Profile</h1>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            // Cover upload logic (optional)
                        }}
                    />
                    <button
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg backdrop-blur-sm transition"
                    >
                        <Camera className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full bg-white dark:bg-slate-800 p-1">
                                {user.avatar_url ? (
                                    <Image
                                        src={user.avatar_url}
                                        alt="Avatar"
                                        width={96}
                                        height={96}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <User className="h-10 w-10" />
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-800 hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {uploading ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Camera className="h-3 w-3" />
                                )}
                            </button>
                        </div>
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            disabled={saving}
                            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${isEditing
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
                                }`}
                        >
                            {saving ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                            ) : isEditing ? (
                                <><Save className="h-4 w-4" /> Save Changes</>
                            ) : (
                                'Edit Profile'
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={user.name}
                                        onChange={e => setUser({ ...user, name: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                ) : (
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        {user.name || 'Not set'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Email Address</label>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    {user.email}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Role</label>
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                    <Shield className="h-4 w-4 text-indigo-500" />
                                    <span className="capitalize">{user.role}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Phone</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={user.phone}
                                        onChange={e => setUser({ ...user, phone: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        {user.phone || 'Not set'}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Location</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={user.location}
                                        onChange={e => setUser({ ...user, location: e.target.value })}
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder="New York, USA"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        {user.location || 'Not set'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Bio</label>
                        {isEditing ? (
                            <textarea
                                value={user.bio}
                                onChange={e => setUser({ ...user, bio: e.target.value })}
                                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white h-24 resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        ) : (
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {user.bio || 'No bio added yet.'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
