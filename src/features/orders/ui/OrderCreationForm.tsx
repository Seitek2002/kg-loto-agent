'use client';

import { useState } from 'react';
import { Button, Input } from '@/shared/ui';
import type { Ticket, Client } from '@/shared/types';
import { formatPrice } from '@/shared/lib/utils';

interface OrderCreationFormProps {
  selectedTickets: Ticket[];
  onSubmit: (client: Client) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function OrderCreationForm({
  selectedTickets,
  onSubmit,
  onCancel,
  loading,
}: OrderCreationFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});

  const total = selectedTickets.reduce((sum, t) => sum + t.price, 0);

  const validate = () => {
    const errs: typeof errors = {};
    if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
      errs.fullName = 'Введите полное ФИО (минимум имя и фамилия)';
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Введите корректный номер телефона';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ fullName: fullName.trim(), phone: phone.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl bg-slate-50 p-3 space-y-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Выбранные билеты</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {selectedTickets.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-1 text-sm font-medium text-slate-700"
            >
              {t.series}-{t.number}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
          <span className="text-sm text-slate-600">Итого:</span>
          <span className="text-base font-bold text-brand-blue">{formatPrice(total)}</span>
        </div>
      </div>

      <Input
        label="ФИО клиента"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Асанов Нурбек Болотович"
        error={errors.fullName}
      />

      <Input
        label="Номер телефона"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+996 700 000 000"
        error={errors.phone}
      />

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Отмена
        </Button>
        <Button type="submit" variant="primary" loading={loading} className="flex-1">
          Создать заказ
        </Button>
      </div>
    </form>
  );
}
