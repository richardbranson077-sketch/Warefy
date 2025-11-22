'use client';

import { useState } from 'react';
import {
    Users,
    MessageSquare,
    Send,
    Paperclip,
    Video,
    Phone,
    Calendar,
    Bell,
    Search,
    Plus,
    MoreVertical,
    CheckCircle,
    Clock,
    AlertCircle,
    Star,
    Hash,
    AtSign,
    Smile,
    Image as ImageIcon,
    File,
    Download,
    Eye,
    Trash2,
    Edit,
    Share2,
    UserPlus,
    Settings
} from 'lucide-react';

interface Message {
    id: string;
    user: string;
    avatar: string;
    content: string;
    timestamp: Date;
    attachments?: { name: string; type: string; size: string }[];
}

interface Channel {
    id: string;
    name: string;
    type: 'channel' | 'dm';
    unread: number;
    members?: number;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    status: 'online' | 'away' | 'offline';
    avatar: string;
}

export default function CollaborationPage() {
    const [selectedChannel, setSelectedChannel] = useState<string>('general');
    const [messageInput, setMessageInput] = useState('');
    const [showMembers, setShowMembers] = useState(true);

    const channels: Channel[] = [
        { id: 'general', name: 'general', type: 'channel', unread: 0, members: 12 },
        { id: 'operations', name: 'operations', type: 'channel', unread: 3, members: 8 },
        { id: 'warehouse', name: 'warehouse', type: 'channel', unread: 0, members: 6 },
        { id: 'logistics', name: 'logistics', type: 'channel', unread: 1, members: 10 },
        { id: 'support', name: 'support', type: 'channel', unread: 5, members: 15 }
    ];

    const directMessages: Channel[] = [
        { id: 'dm1', name: 'John Doe', type: 'dm', unread: 2 },
        { id: 'dm2', name: 'Jane Smith', type: 'dm', unread: 0 },
        { id: 'dm3', name: 'Mike Johnson', type: 'dm', unread: 1 }
    ];

    const teamMembers: TeamMember[] = [
        { id: '1', name: 'John Doe', role: 'Operations Manager', status: 'online', avatar: 'JD' },
        { id: '2', name: 'Jane Smith', role: 'Warehouse Lead', status: 'online', avatar: 'JS' },
        { id: '3', name: 'Mike Johnson', role: 'Logistics Coordinator', status: 'away', avatar: 'MJ' },
        { id: '4', name: 'Sarah Wilson', role: 'Inventory Specialist', status: 'online', avatar: 'SW' },
        { id: '5', name: 'Tom Anderson', role: 'Driver', status: 'offline', avatar: 'TA' }
    ];

    const messages: Message[] = [
        {
            id: '1',
            user: 'John Doe',
            avatar: 'JD',
            content: 'Hey team! Just wanted to update everyone on the shipment status. All packages for Route NY-101 are ready for dispatch.',
            timestamp: new Date(Date.now() - 3600000)
        },
        {
            id: '2',
            user: 'Jane Smith',
            avatar: 'JS',
            content: 'Great! I\'ve confirmed the inventory counts. Everything matches the manifest.',
            timestamp: new Date(Date.now() - 3000000)
        },
        {
            id: '3',
            user: 'Mike Johnson',
            avatar: 'MJ',
            content: 'Driver is en route. ETA is 2:30 PM. I\'ll keep monitoring the GPS.',
            timestamp: new Date(Date.now() - 1800000),
            attachments: [
                { name: 'route_map.pdf', type: 'pdf', size: '2.4 MB' }
            ]
        },
        {
            id: '4',
            user: 'Sarah Wilson',
            avatar: 'SW',
            content: 'Perfect! I\'ve updated the system. All SKUs are marked as shipped.',
            timestamp: new Date(Date.now() - 900000)
        }
    ];

    const handleSendMessage = () => {
        if (messageInput.trim()) {
            // Handle message sending
            setMessageInput('');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'away': return 'bg-yellow-500';
            case 'offline': return 'bg-gray-400';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            Team Collaboration
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">Real-time messaging and coordination</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <Search className="h-5 w-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <Bell className="h-5 w-5 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <Settings className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-gray-800 text-white flex flex-col">
                    <div className="p-4">
                        <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition flex items-center justify-center gap-2">
                            <Plus className="h-4 w-4" />
                            New Channel
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {/* Channels */}
                        <div className="px-4 py-2">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Channels</h3>
                            {channels.map(channel => (
                                <button
                                    key={channel.id}
                                    onClick={() => setSelectedChannel(channel.id)}
                                    className={`w-full px-3 py-2 rounded-lg mb-1 flex items-center justify-between transition ${selectedChannel === channel.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <Hash className="h-4 w-4" />
                                        {channel.name}
                                    </span>
                                    {channel.unread > 0 && (
                                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                            {channel.unread}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Direct Messages */}
                        <div className="px-4 py-2 mt-4">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Direct Messages</h3>
                            {directMessages.map(dm => (
                                <button
                                    key={dm.id}
                                    onClick={() => setSelectedChannel(dm.id)}
                                    className={`w-full px-3 py-2 rounded-lg mb-1 flex items-center justify-between transition ${selectedChannel === dm.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        {dm.name}
                                    </span>
                                    {dm.unread > 0 && (
                                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                            {dm.unread}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {/* Chat Header */}
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Hash className="h-5 w-5 text-gray-600" />
                            <div>
                                <h2 className="font-bold text-gray-900">{selectedChannel}</h2>
                                <p className="text-sm text-gray-600">
                                    {channels.find(c => c.id === selectedChannel)?.members || 0} members
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <Phone className="h-5 w-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <Video className="h-5 w-5 text-gray-600" />
                            </button>
                            <button
                                onClick={() => setShowMembers(!showMembers)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <Users className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map(message => (
                            <div key={message.id} className="flex gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {message.avatar}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-900">{message.user}</span>
                                        <span className="text-xs text-gray-500">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-gray-700">{message.content}</p>
                                    {message.attachments && (
                                        <div className="mt-2 space-y-2">
                                            {message.attachments.map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 max-w-md">
                                                    <File className="h-8 w-8 text-blue-600" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                        <p className="text-xs text-gray-500">{file.size}</p>
                                                    </div>
                                                    <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                                                        <Download className="h-4 w-4 text-gray-600" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-gray-200 p-4">
                        <div className="flex items-end gap-3">
                            <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                                <textarea
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder={`Message #${selectedChannel}`}
                                    className="w-full px-4 py-3 bg-transparent outline-none resize-none"
                                    rows={3}
                                />
                                <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                                            <Paperclip className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                                            <ImageIcon className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                                            <Smile className="h-4 w-4 text-gray-600" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim()}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Members Sidebar */}
                {showMembers && (
                    <div className="w-64 bg-gray-50 border-l border-gray-200 overflow-y-auto">
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 mb-4">Team Members ({teamMembers.length})</h3>
                            <div className="space-y-2">
                                {teamMembers.map(member => (
                                    <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                {member.avatar}
                                            </div>
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                                            <p className="text-xs text-gray-600">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
