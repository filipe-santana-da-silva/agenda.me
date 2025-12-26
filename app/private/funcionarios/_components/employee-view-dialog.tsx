'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Calendar, MapPin, Clock, Briefcase } from 'lucide-react';

type Employee = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  position: string;
  department?: string;
  hire_date: string;
  salary?: number;
  status: 'active' | 'inactive' | 'on_leave';
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  birth_date?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  notes?: string;
  work_start?: string;
  work_end?: string;
  lunch_start?: string;
  lunch_end?: string;
  break_intervals?: string | Record<string, unknown>;
};

interface EmployeeViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EmployeeViewDialog({ open, onOpenChange, employee }: EmployeeViewDialogProps) {
  if (!employee) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'on_leave': return 'Em Licença';
      default: return status;
    }
  };

  const formatBreakIntervals = (intervals: string | Record<string, unknown> | undefined) => {
    try {
      if (!intervals) return 'Nenhum intervalo configurado'
      const parsed = typeof intervals === 'string' ? JSON.parse(intervals) : intervals;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((interval: Record<string, unknown>) => 
          `${interval.start} - ${interval.end} (${interval.name || 'Intervalo'})`
        ).join(', ');
      }
      return 'Nenhum intervalo configurado';
    } catch {
      return 'Nenhum intervalo configurado';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Detalhes do Funcionário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {employee.name}
                <Badge className={getStatusColor(employee.status)}>
                  {getStatusLabel(employee.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{employee.position}</span>
                </div>
                {employee.department && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{employee.department}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Horários de Trabalho */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horários de Trabalho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expediente</p>
                  <p className="text-sm">{employee.work_start || '08:00'} - {employee.work_end || '18:00'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Almoço</p>
                  <p className="text-sm">{employee.lunch_start || '12:00'} - {employee.lunch_end || '13:00'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Intervalos</p>
                <p className="text-sm">{formatBreakIntervals(employee.break_intervals)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employee.cpf && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">CPF</p>
                    <p className="text-sm">{employee.cpf}</p>
                  </div>
                )}
                {employee.birth_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Data de Nascimento</p>
                    <p className="text-sm">{new Date(employee.birth_date).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-600">Data de Admissão</p>
                  <p className="text-sm">{new Date(employee.hire_date).toLocaleDateString('pt-BR')}</p>
                </div>
                {employee.salary && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Salário</p>
                    <p className="text-sm">R$ {employee.salary.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contato de Emergência */}
          {(employee.emergency_contact || employee.emergency_phone) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contato de Emergência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.emergency_contact && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nome</p>
                      <p className="text-sm">{employee.emergency_contact}</p>
                    </div>
                  )}
                  {employee.emergency_phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Telefone</p>
                      <p className="text-sm">{employee.emergency_phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {employee.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{employee.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}