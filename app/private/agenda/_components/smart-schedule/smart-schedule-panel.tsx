'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, Zap, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SmartSchedulePanelProps {
  selectedDate: string;
  professionalId: string;
  onOptimizationApplied: () => void;
}

export function SmartSchedulePanel({ selectedDate, professionalId, onOptimizationApplied }: SmartSchedulePanelProps) {
  const [loading, setLoading] = useState(false);
  const [optimizations, setOptimizations] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    if (selectedDate && professionalId) {
      loadOptimizationStats();
    }
  }, [selectedDate, professionalId]);

  const loadOptimizationStats = async () => {
    try {
      const response = await fetch(`/api/schedule/optimize?date=${selectedDate}&professionalId=${professionalId}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const createAutomaticBlocks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schedule/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, professionalId })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        onOptimizationApplied();
      } else {
        toast.error('Erro ao criar bloqueios automáticos');
      }
    } catch (error) {
      toast.error('Erro ao processar bloqueios');
    } finally {
      setLoading(false);
    }
  };

  const optimizeSchedule = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schedule/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, professionalId })
      });

      const result = await response.json();
      if (result.success) {
        setOptimizations(result.optimizations);
        toast.success(result.message);
        loadOptimizationStats();
      } else {
        toast.error('Erro ao otimizar agenda');
      }
    } catch (error) {
      toast.error('Erro ao processar otimização');
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async (appointmentId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/schedule/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, reason: 'Otimização de agenda' })
      });

      const result = await response.json();
      if (result.success) {
        setSuggestions(result.suggestions);
        toast.success(result.message);
      } else {
        toast.error('Erro ao gerar sugestões');
      }
    } catch (error) {
      toast.error('Erro ao processar sugestões');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            Agenda Inteligente
          </CardTitle>
          <CardDescription>
            Otimização automática e sugestões inteligentes para {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.appointmentsAnalyzed || 0}</div>
              <div className="text-xs text-gray-600">Agendamentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.avgGap || 0}min</div>
              <div className="text-xs text-gray-600">Gap Médio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalOptimizationScore || 0}</div>
              <div className="text-xs text-gray-600">Score Otimização</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalGaps || 0}min</div>
              <div className="text-xs text-gray-600">Gaps Totais</div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={createAutomaticBlocks}
              disabled={loading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Clock className="w-4 h-4" />
              Bloquear Intervalos
            </Button>
            
            <Button 
              onClick={optimizeSchedule}
              disabled={loading}
              size="sm"
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Otimizar Agenda
            </Button>
          </div>

          {/* Otimizações Sugeridas */}
          {optimizations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Otimizações Sugeridas
              </h4>
              {optimizations.map((opt, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{opt.customerName}</p>
                      <p className="text-sm text-gray-600">{opt.reason}</p>
                      <p className="text-xs text-gray-500">
                        {opt.currentTime} → {opt.suggestedTime}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      -{opt.gapReduction}min
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sugestões de Reagendamento */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Sugestões de Reagendamento
              </h4>
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {new Date(suggestion.suggested_date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-600">{suggestion.suggested_time}</p>
                    </div>
                    <Badge variant="outline">
                      Score: {suggestion.priority_score}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}