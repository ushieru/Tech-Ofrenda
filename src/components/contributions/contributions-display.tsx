'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Contribution {
  id: string;
  type: 'MONETARY' | 'IN_KIND';
  amount?: number;
  description?: string;
  donorName: string;
  donorEmail?: string;
  confirmed: boolean;
  createdAt: string;
}

interface ContributionsDisplayProps {
  eventId: string;
  showAll?: boolean;
}

export function ContributionsDisplay({ eventId, showAll = false }: ContributionsDisplayProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContributions();
  }, [eventId]);

  const fetchContributions = async () => {
    try {
      const response = await fetch(`/api/contributions?eventId=${eventId}&confirmed=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch contributions');
      }
      const data = await response.json();
      setContributions(data.contributions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const totalMonetary = contributions
    .filter(c => c.type === 'MONETARY' && c.confirmed)
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const confirmedContributions = contributions.filter(c => c.confirmed);
  const displayContributions = showAll ? confirmedContributions : confirmedContributions.slice(0, 5);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Error loading contributions: {error}</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2 flex items-center">
          🎁 Ofrendas Digitales
        </h3>
        <div className="flex items-center space-x-4">
          <div className="bg-orange-100 px-3 py-1 rounded-full">
            <span className="text-orange-800 font-medium">
              Total recaudado: ${totalMonetary.toLocaleString('es-MX')} MXN
            </span>
          </div>
          <div className="text-gray-600">
            {confirmedContributions.length} contribuciones
          </div>
        </div>
      </div>

      {confirmedContributions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🌼</div>
          <p>Aún no hay ofrendas para este evento.</p>
          <p className="text-sm">¡Sé el primero en contribuir!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayContributions.map((contribution) => (
            <div
              key={contribution.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
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
                  </div>
                  
                  {contribution.type === 'MONETARY' && contribution.amount && (
                    <p className="text-lg font-semibold text-green-600 mb-1">
                      ${contribution.amount.toLocaleString('es-MX')} MXN
                    </p>
                  )}
                  
                  {contribution.description && (
                    <p className="text-gray-600 text-sm">
                      {contribution.description}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(contribution.createdAt).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                
                <div className="text-2xl ml-4">
                  {contribution.type === 'MONETARY' ? '🪙' : '🎁'}
                </div>
              </div>
            </div>
          ))}
          
          {!showAll && confirmedContributions.length > 5 && (
            <div className="text-center pt-4">
              <button
                onClick={() => window.location.reload()} // Simple refresh to show all
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Ver todas las contribuciones ({confirmedContributions.length})
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}