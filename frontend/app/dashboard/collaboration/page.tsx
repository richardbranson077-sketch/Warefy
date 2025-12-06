'use client';

import { useState, useEffect, useRef } from 'react';
import { collaborationService, Team, Message, Task, TeamMember, Notification } from '@/services/collaboration.service';
import {
    Mail, User, Bell, RefreshCw, ArrowRight, Plus, CheckCircle,
    Clock, AlertCircle, Sparkles, X, Check
} from 'lucide-react';

export default function CollaborationPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const [newMessage, setNewMessage] = useState('');
    const [newTeamName, setNewTeamName] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [summary, setSummary] = useState<any>(null);

    const [loading, setLoading] = useState(false);
    const [showNewTeamModal, setShowNewTeamModal] = useState(false);
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [voiceMessages, setVoiceMessages] = useState<Map<number, string>>(new Map()); // messageId -> audio URL

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadTeams();
        loadNotifications();
    }, []);

    useEffect(() => {
        if (selectedTeam) {
            loadTeamData(selectedTeam.id);
        }
    }, [selectedTeam]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadTeams = async () => {
        try {
            const data = await collaborationService.getTeams();
            setTeams(data);
            if (data.length > 0 && !selectedTeam) {
                setSelectedTeam(data[0]);
            }
        } catch (error) {
            console.error('Failed to load teams:', error);
        }
    };

    const loadTeamData = async (teamId: number) => {
        setLoading(true);
        try {
            const [msgs, tsks, mems] = await Promise.all([
                collaborationService.getMessages(teamId),
                collaborationService.getTasks(teamId),
                collaborationService.getTeamMembers(teamId)
            ]);
            setMessages(msgs);
            setTasks(tsks);
            setMembers(mems);
        } catch (error) {
            console.error('Failed to load team data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadNotifications = async () => {
        try {
            const data = await collaborationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    const createTeam = async () => {
        if (!newTeamName.trim()) return;
        try {
            const team = await collaborationService.createTeam(newTeamName);
            setTeams([...teams, team]);
            setNewTeamName('');
            setShowNewTeamModal(false);
            setSelectedTeam(team);
        } catch (error) {
            console.error('Failed to create team:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedTeam) return;
        try {
            const msg = await collaborationService.sendMessage(selectedTeam.id, newMessage);
            setMessages([...messages, msg]);
            setNewMessage('');
            setAiSuggestion('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const generateAIReply = async () => {
        if (!selectedTeam || messages.length === 0) return;
        setGeneratingAI(true);
        try {
            const recentMessages = messages.slice(-5).map(m => `${m.username}: ${m.content}`).join('\n');
            const result = await collaborationService.generateAIReply(recentMessages);
            setAiSuggestion(result.suggestedReply);
        } catch (error) {
            console.error('Failed to generate AI reply:', error);
        } finally {
            setGeneratingAI(false);
        }
    };

    const generateSummary = async () => {
        if (!selectedTeam) return;
        setGeneratingAI(true);
        try {
            const result = await collaborationService.summarizeDiscussion(selectedTeam.id);
            setSummary(result);
            setShowSummary(true);
        } catch (error) {
            console.error('Failed to generate summary:', error);
        } finally {
            setGeneratingAI(false);
        }
    };

    const createTask = async () => {
        if (!newTaskTitle.trim() || !selectedTeam) return;
        try {
            const task = await collaborationService.createTask(selectedTeam.id, {
                title: newTaskTitle,
                priority: 'medium'
            });
            setTasks([...tasks, task]);
            setNewTaskTitle('');
            setShowNewTaskModal(false);
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const updateTaskStatus = async (taskId: number, status: string) => {
        try {
            await collaborationService.updateTask(taskId, { status });
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const getSentimentColor = (sentiment?: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-600';
            case 'negative': return 'text-red-600';
            case 'urgent': return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };

    const getSentimentIcon = (sentiment?: string) => {
        switch (sentiment) {
            case 'positive': return <CheckCircle className="h-4 w-4" />;
            case 'negative': return <AlertCircle className="h-4 w-4" />;
            case 'urgent': return <Bell className="h-4 w-4" />;
            default: return null;
        }
    };

    // Voice recording functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setAudioBlob(null);
            setRecordingTime(0);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    const sendVoiceMessage = async () => {
        if (!audioBlob || !selectedTeam) return;

        try {
            // Create audio URL for playback
            const audioUrl = URL.createObjectURL(audioBlob);

            // For now, send a text message indicating voice message was sent
            const duration = Math.floor(recordingTime);

            const msg = await collaborationService.sendMessage(
                selectedTeam.id,
                `🎤 Voice message (${duration}s)`
            );

            // Store the audio URL mapped to the message
            setVoiceMessages(prev => new Map(prev).set(msg.id, audioUrl));

            // Refresh messages
            const msgs = await collaborationService.getMessages(selectedTeam.id);
            setMessages(msgs);

            // Reset
            setAudioBlob(null);
            setRecordingTime(0);
        } catch (error) {
            console.error('Failed to send voice message:', error);
            alert('Failed to send voice message: ' + (error as Error).message);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Mail className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Team Collaboration</h1>
                            <p className="text-sm text-gray-500">Real-time messaging with AI assistance</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowNewTeamModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="h-4 w-4" />
                            New Team
                        </button>
                        <button
                            onClick={loadNotifications}
                            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex h-[calc(100vh-80px)]">
                {/* Left Sidebar - Teams */}
                <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
                    <div className="p-4">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Your Teams</h2>
                        {teams.map(team => (
                            <button
                                key={team.id}
                                onClick={() => setSelectedTeam(team)}
                                className={`w-full text-left p-3 rounded-lg mb-2 transition ${selectedTeam?.id === team.id
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="font-medium text-gray-900">{team.name}</div>
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {team.memberCount} members
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center - Messages */}
                <div className="flex-1 flex flex-col">
                    {selectedTeam ? (
                        <>
                            {/* Team Header */}
                            <div className="bg-white border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">{selectedTeam.name}</h2>
                                        <p className="text-sm text-gray-500">{selectedTeam.description}</p>
                                    </div>
                                    <button
                                        onClick={generateSummary}
                                        disabled={generatingAI}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                                    >
                                        <Sparkles className={`h-4 w-4 ${generatingAI ? 'animate-spin' : ''}`} />
                                        AI Summary
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                                    </div>
                                ) : (
                                    <>
                                        {messages.map(msg => (
                                            <div key={msg.id} className="flex gap-3">
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-gray-900">{msg.username}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(msg.createdAt).toLocaleTimeString()}
                                                        </span>
                                                        {msg.sentiment && (
                                                            <span className={`flex items-center gap-1 ${getSentimentColor(msg.sentiment)}`}>
                                                                {getSentimentIcon(msg.sentiment)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {voiceMessages.has(msg.id) ? (
                                                        <div className="mt-1">
                                                            <audio controls src={voiceMessages.get(msg.id)} className="w-full max-w-[300px] h-10" />
                                                            <p className="text-xs text-gray-500 mt-1">{msg.content}</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-700">{msg.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* AI Suggestion */}
                            {aiSuggestion && (
                                <div className="px-6 py-3 bg-purple-50 border-t border-purple-200">
                                    <div className="flex items-start gap-2">
                                        <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-purple-900 mb-1">AI Suggested Reply:</p>
                                            <p className="text-sm text-purple-700">{aiSuggestion}</p>
                                        </div>
                                        <button
                                            onClick={() => setNewMessage(aiSuggestion)}
                                            className="text-sm text-purple-600 hover:text-purple-700"
                                        >
                                            Use
                                        </button>
                                        <button
                                            onClick={() => setAiSuggestion('')}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Message Input */}
                            <div className="bg-white border-t border-gray-200 px-6 py-4">
                                {/* Voice Recording Preview */}
                                {audioBlob && (
                                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm">🎤</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Voice Message</p>
                                                    <p className="text-xs text-gray-500">{formatTime(recordingTime)}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={sendVoiceMessage}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                                >
                                                    Send
                                                </button>
                                                <button
                                                    onClick={() => setAudioBlob(null)}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Recording Indicator */}
                                {isRecording && (
                                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-3 w-3 bg-red-600 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-medium text-red-900">
                                                    Recording... {formatTime(recordingTime)}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={stopRecording}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                                                >
                                                    Stop
                                                </button>
                                                <button
                                                    onClick={cancelRecording}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Type a message... (use @username to mention)"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isRecording}
                                    />
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`px-4 py-2 rounded-lg transition ${isRecording
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        title={isRecording ? "Stop recording" : "Record voice message"}
                                    >
                                        <span className="text-xl">{isRecording ? '⏹️' : '🎤'}</span>
                                    </button>
                                    <button
                                        onClick={generateAIReply}
                                        disabled={generatingAI || isRecording}
                                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
                                        title="Get AI suggestion"
                                    >
                                        <Sparkles className={`h-5 w-5 ${generatingAI ? 'animate-spin' : ''}`} />
                                    </button>
                                    <button
                                        onClick={sendMessage}
                                        disabled={isRecording}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        <ArrowRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                                <Mail className="h-16 w-16 mx-auto mb-4" />
                                <p>Select a team to start collaborating</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Members & Tasks */}
                {selectedTeam && (
                    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
                        {/* Members */}
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Team Members</h3>
                            <div className="space-y-2">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{member.username}</p>
                                            <p className="text-xs text-gray-500">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tasks */}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase">Tasks</h3>
                                <button
                                    onClick={() => setShowNewTaskModal(true)}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {tasks.map(task => (
                                    <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                            <button
                                                onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                                                className={`flex-shrink-0 ${task.status === 'done' ? 'text-green-600' : 'text-gray-400'
                                                    }`}
                                            >
                                                {task.status === 'done' ? (
                                                    <CheckCircle className="h-5 w-5" />
                                                ) : (
                                                    <Clock className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                        {task.assigneeName && (
                                            <p className="text-xs text-gray-500">Assigned to: {task.assigneeName}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-xs px-2 py-1 rounded ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {task.priority}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${task.status === 'done' ? 'bg-green-100 text-green-700' :
                                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* New Team Modal */}
            {showNewTeamModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h2 className="text-xl font-bold mb-4">Create New Team</h2>
                        <input
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            placeholder="Team name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={createTeam}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setShowNewTeamModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Task Modal */}
            {showNewTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Task title"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={createTask}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setShowNewTaskModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Modal */}
            {showSummary && summary && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-purple-600" />
                                AI Discussion Summary
                            </h2>
                            <button
                                onClick={() => setShowSummary(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                                <p className="text-gray-700">{summary.summary}</p>
                            </div>

                            {summary.keyPoints && summary.keyPoints.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Key Points</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {summary.keyPoints.map((point: string, i: number) => (
                                            <li key={i} className="text-gray-700">{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {summary.actionItems && summary.actionItems.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Action Items</h3>
                                    <ul className="space-y-2">
                                        {summary.actionItems.map((item: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
