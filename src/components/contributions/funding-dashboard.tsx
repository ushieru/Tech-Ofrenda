'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

interface Contribution {
  id: string;
  type: 'MONETARY' | 'IN_KIND';
  amount?: number;
  description?: string;
  donorName: string;
  donorEmail?: string;
  confirmed: boolean;
  createdAt: string;
  event: {
    id: string;
    title: string;
  };
}

interface FundingStats {
  totalMonetary: number;
  totalContributions: number;
  pendingContributions: number;
  confirmedContributions: number;
  inKindContributions: number;
}

interface FundingDashboardProps {
  userGroupId: string;
}

export function FundingDashboard({ userGroupId }: FundingDashboardProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [stats, setStats] = useState<FundingStats>({
    totalMonetary: 0,
    totalContributions: 0,
    pendingContributions: 0,
    confirmedContributions: 0,
    inKindContributions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  useEffect(() => {
    fetchContributions();
  }, [userGroupId]);

  const fetchContributions = async () => {
    try {
      const response = await fetch(`/api/contributions?userGroupId=${userGroupId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contributions');
      }
      const data = await response.json();
      const fetchedContributions = data.contributions || [];
      
      setContributions(fetchedContributions);
      calculateStats(fetchedContributions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (contributions: Contribution[]) => {
    const stats = contributions.reduce(
      (acc, contribution) => {
        acc.totalContributions++;
        
        if (contribution.confirmed) {
          acc.confirmedContributions++;
          if (contribution.type === 'MONETARY' && contribution.amount) {
            acc.totalMonetary += contribution.amount;
          }
        } else {
          acc.pendingContributions++;
        }
        
        if (contribution.type === 'IN_KIND') {
          acc.inKindContributions++;
        }
        
        return acc;
      },
      {
        totalMonetary: 0,
        totalContributions: 0,
        pendingContributions: 0,
        confirmedContributions: 0,
        inKindContributions: 0,
      }
    );
    
    setStats(stats);
  };

  const handleConfirmContribution = async (contributionId: string, confirmed: boolean) => {
    try {
      const response = await fetch(`/api/contributions/${contributionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update contribution');
      }

      // Refresh contributions
      await fetchContributions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contribution');
    }
  };

  const filteredContributions = contributions.filter(contribution => {
    if (filter === 'pending') return !contribution.confirmed;
    if (filter === 'confirmed') return contribution.confirmed;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 text-red-800">
        Error loading funding data: {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Recaudado</div>
          <div className="text-2xl font-bold text-green-600">
            ${stats.totalMonetary.toLocaleString('es-MX')}
          </div>
          <div className="text-xs text-gray-500">MXN</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Contribuciones</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalContributions}
          </div>
          <div className="text-xs text-gray-500">
            {stats.confirmedContributions} confirmadas
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-gray-600">Pendientes</div>
          <div className="text-2xl font-bold text-orange-600">
            {stats.pendingContributions}
          </div>
          <div className="text-xs text-gray-500">Requieren revisión</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-gray-600">En Especie</div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.inKindContributions}
          </div>
          <div className="text-xs text-gray-500">Productos/Servicios</div>
        </Card>
      </div>

      {/* Contributions List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Gestión de Contribuciones</h3>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({contributions.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendientes ({stats.pendingContributions})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'confirmed'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmadas ({stats.confirmedContributions})
            </button>
          </div>
        </div>

        {filteredContributions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No hay contribuciones para mostrar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContributions.map((contribution) => (
              <div
                key={contribution.id}
                className={`border rounded-lg p-4 ${
                  contribution.confirmed
                    ? 'border-green-200 bg-green-50'
                    : 'border-orange-200 bg-orange-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {contribution.donorName}
                      </span>
                      <Badge
                        variant={contribution.type === 'MONETARY' ? 'default' : 'secondary'}
                        className={
                          contribution.type === 'MONETARY'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {contribution.type === 'MONETARY' ? '💰 Monetaria' : '🎁 En Especie'}
                      </Badge>
                      <Badge
                        variant={contribution.confirmed ? 'default' : 'secondary'}
                        className={
                          contribution.confirmed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }
                      >
                        {contribution.confirmed ? '✅ Confirmada' : '⏳ Pendiente'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      Evento: <span className="font-medium">{contribution.event.title}</span>
                    </p>
                    
                    {contribution.type === 'MONETARY' && contribution.amount && (
                      <p className="text-lg font-semibold text-green-600 mb-1">
                        ${contribution.amount.toLocaleString('es-MX')} MXN
                      </p>
                    )}
                    
                    {contribution.description && (
                      <p className="text-gray-600 text-sm mb-2">
                        {contribution.description}
                      </p>
                    )}
                    
                    {contribution.donorEmail && (
                      <p className="text-xs text-gray-500 mb-2">
                        Contacto: {contribution.donorEmail}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-400">
                      {new Date(contribution.createdAt).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {!contribution.confirmed && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirmContribution(contribution.id, true)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        ✅ Confirmar
                      </Button>
                    )}
                    
                    {contribution.confirmed && contribution.type === 'IN_KIND' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConfirmContribution(contribution.id, false)}
                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        ⏳ Marcar Pendiente
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}