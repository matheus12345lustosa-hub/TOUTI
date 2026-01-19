"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Calendar, Users, FileText, Plus, Trash2 } from "lucide-react";

interface Meeting {
    id: string;
    title: string;
    date: string;
    content: string;
    participants: string;
}

export default function MeetingsPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        date: new Date().toISOString().split('T')[0],
        content: "",
        participants: ""
    });

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const res = await fetch('/api/dashboard/meetings');
            if (res.ok) setMeetings(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/dashboard/meetings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchMeetings();
                setIsCreating(false);
                setFormData({
                    title: "",
                    date: new Date().toISOString().split('T')[0],
                    content: "",
                    participants: ""
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir esta reunião?")) return;
        await fetch(`/api/dashboard/meetings?id=${id}`, { method: 'DELETE' });
        fetchMeetings();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Calendar className="h-8 w-8 text-blue-600" />
                        Atas de Reunião
                    </h1>
                    <p className="text-slate-500">Registre e organize o que foi discutido.</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm">
                    {isCreating ? "Cancelar" : "Nova Reunião"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Column */}
                {isCreating && (
                    <div className="lg:col-span-1">
                        <Card className="bg-white border-rose-100 shadow-sm sticky top-4">
                            <CardHeader>
                                <CardTitle className="text-slate-800">Nova Ata</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Título</label>
                                        <Input
                                            placeholder="Ex: Alinhamento Semanal"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Data</label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            required
                                            className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Participantes</label>
                                        <Input
                                            placeholder="Ex: João, Maria..."
                                            value={formData.participants}
                                            onChange={e => setFormData({ ...formData, participants: e.target.value })}
                                            className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Pauta / Decisões</label>
                                        <Textarea
                                            className="min-h-[150px] bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200"
                                            placeholder="Descreva o que foi decidido..."
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm">
                                        Salvar Ata
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* List Column */}
                <div className={isCreating ? "lg:col-span-2" : "lg:col-span-3"}>
                    <div className="space-y-4">
                        {meetings.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 border border-rose-100 rounded-xl bg-white shadow-sm">
                                Nenhuma reunião registrada.
                            </div>
                        ) : (
                            meetings.map(meeting => (
                                <Card key={meeting.id} className="bg-white border-rose-100 hover:border-rose-200 transition-all shadow-sm">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg text-slate-800">{meeting.title}</CardTitle>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(meeting.date).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    {meeting.participants && (
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {meeting.participants}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(meeting.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap">
                                            {meeting.content}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
