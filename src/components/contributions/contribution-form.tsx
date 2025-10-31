'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { monetaryContributionSchema, inKindContributionSchema, type MonetaryContributionInput, type InKindContributionInput } from '@/lib/validations/contribution';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

interface ContributionFormProps {
  eventId: string;
  eventTitle: string;
  onSuccess?: () => void;
}

type ContributionType = 'MONETARY' | 'IN_KIND';

export function ContributionForm({ eventId, eventTitle, onSuccess }: ContributionFormProps) {
  const [contributionType, setContributionType] = useState<ContributionType>('MONETARY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const monetaryForm = useForm<MonetaryContributionInput>({
    resolver: zodResolver(monetaryContributionSchema),
    defaultValues: {
      eventId,
      amount: 100,
      donorName: '',
      donorEmail: '',
      message: '',
    },
  });

  const inKindForm = useForm<InKindContributionInput>({
    resolver: zodResolver(inKindContributionSchema),
    defaultValues: {
      eventId,
      description: '',
      donorName: '',
      donorEmail: '',
      estimatedValue: 0,
    },
  });

  const predefinedAmounts = [50, 100, 250, 500, 1000];

  const handleMonetarySubmit = async (data: MonetaryContributionInput) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'MONETARY',
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contribution');
      }

      const result = await response.json();
      
      // Here you would integrate with Stripe Elements for payment processing
      // For now, we'll show a success message
      setSuccess('¡Gracias por tu ofrenda! Serás redirigido al procesamiento de pago.');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInKindSubmit = async (data: InKindContributionInput) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'IN_KIND',
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contribution');
      }

      setSuccess('¡Gracias por tu ofrenda en especie! Los organizadores la revisarán pronto.');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Hacer una Ofrenda Digital</h3>
        <p className="text-gray-600">Apoya el evento "{eventTitle}" con tu contribución</p>
      </div>

      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
          {error}
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
          {success}
        </Alert>
      )}

      {/* Contribution Type Selector */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setContributionType('MONETARY')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              contributionType === 'MONETARY'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💰 Contribución Monetaria
          </button>
          <button
            type="button"
            onClick={() => setContributionType('IN_KIND')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              contributionType === 'IN_KIND'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎁 Contribución en Especie
          </button>
        </div>
      </div>

      {contributionType === 'MONETARY' ? (
        <form onSubmit={monetaryForm.handleSubmit(handleMonetarySubmit)} className="space-y-4">
          {/* Predefined Amounts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad (MXN)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {predefinedAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => monetaryForm.setValue('amount', amount)}
                  className={`p-2 border rounded-lg text-center transition-colors ${
                    monetaryForm.watch('amount') === amount
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="100000"
              {...monetaryForm.register('amount', { valueAsNumber: true })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Cantidad personalizada"
            />
            {monetaryForm.formState.errors.amount && (
              <p className="text-red-500 text-sm mt-1">
                {monetaryForm.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* Donor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu nombre *
            </label>
            <input
              type="text"
              {...monetaryForm.register('donorName')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nombre completo"
            />
            {monetaryForm.formState.errors.donorName && (
              <p className="text-red-500 text-sm mt-1">
                {monetaryForm.formState.errors.donorName.message}
              </p>
            )}
          </div>

          {/* Donor Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (opcional)
            </label>
            <input
              type="email"
              {...monetaryForm.register('donorEmail')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
            {monetaryForm.formState.errors.donorEmail && (
              <p className="text-red-500 text-sm mt-1">
                {monetaryForm.formState.errors.donorEmail.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje (opcional)
            </label>
            <textarea
              {...monetaryForm.register('message')}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Mensaje de apoyo para el evento..."
            />
            {monetaryForm.formState.errors.message && (
              <p className="text-red-500 text-sm mt-1">
                {monetaryForm.formState.errors.message.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSubmitting ? 'Procesando...' : 'Continuar al Pago'}
          </Button>
        </form>
      ) : (
        <form onSubmit={inKindForm.handleSubmit(handleInKindSubmit)} className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción de la contribución *
            </label>
            <textarea
              {...inKindForm.register('description')}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe qué estás ofreciendo (ej: equipos, servicios, productos, etc.)"
            />
            {inKindForm.formState.errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {inKindForm.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Estimated Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor estimado (MXN, opcional)
            </label>
            <input
              type="number"
              min="0"
              {...inKindForm.register('estimatedValue', { valueAsNumber: true })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0"
            />
            {inKindForm.formState.errors.estimatedValue && (
              <p className="text-red-500 text-sm mt-1">
                {inKindForm.formState.errors.estimatedValue.message}
              </p>
            )}
          </div>

          {/* Donor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu nombre *
            </label>
            <input
              type="text"
              {...inKindForm.register('donorName')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nombre completo"
            />
            {inKindForm.formState.errors.donorName && (
              <p className="text-red-500 text-sm mt-1">
                {inKindForm.formState.errors.donorName.message}
              </p>
            )}
          </div>

          {/* Donor Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (opcional)
            </label>
            <input
              type="email"
              {...inKindForm.register('donorEmail')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
            {inKindForm.formState.errors.donorEmail && (
              <p className="text-red-500 text-sm mt-1">
                {inKindForm.formState.errors.donorEmail.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Ofrenda en Especie'}
          </Button>
        </form>
      )}
    </Card>
  );
}