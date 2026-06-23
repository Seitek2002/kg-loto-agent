'use client';

import { useState } from 'react';
import { Button, Input } from '@/shared/ui';
import type { Ticket } from '@/shared/types';

interface OrderCreationFormProps {
  selectedTickets: Ticket[];
  onSubmit: (data: { clientFullName: string; clientPhone: string; clientBirthYear: number }) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

const CURRENT_YEAR = new Date().getFullYear();

export function OrderCreationForm({
  selectedTickets,
  onSubmit,
  onCancel,
  loading,
  error,
}: OrderCreationFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = selectedTickets
    .reduce((s, t) => s + parseFloat(t.ticketPrice || t.price || '0'), 0)
    .toFixed(0);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().split(/\s+/).length < 2) {
      errs.fullName = 'Введите полное ФИО (минимум имя и фамилия)';
    }
    const digits = phone.replace(/\D/g, '');
    if (!digits || digits.length < 9) {
      errs.phone = 'Введите корректный номер телефона';
    }
    const yr = parseInt(birthYear, 10);
    if (!yr || yr < 1900 || yr > CURRENT_YEAR - 18) {
      errs.birthYear = `Клиент должен быть старше 18 лет (год рождения до ${CURRENT_YEAR - 18})`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      clientFullName: fullName.trim(),
      clientPhone: phone.trim(),
      clientBirthYear: parseInt(birthYear, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selected tickets summary */}
      <div className="rounded-xl bg-slate-50 p-3 space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Выбранные билеты</p>
        <div className="flex flex-wrap gap-1.5">
          {selectedTickets.map((t) => (
            <span
              key={t.shortId}
              className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              {t.serial.split('-').slice(-2).join('-')}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
          <span className="text-sm text-slate-600">Итого:</span>
          <span className="text-base font-bold text-brand-blue">{total} сом</span>
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

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Номер телефона"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+996 700 000 000"
          error={errors.phone}
        />
        <Input
          label="Год рождения"
          type="number"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          placeholder="1990"
          min={1900}
          max={CURRENT_YEAR - 18}
          error={errors.birthYear}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 whitespace-pre-line">
          {error}
        </div>
      )}

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
