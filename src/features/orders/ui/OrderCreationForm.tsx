'use client';

import { useState } from 'react';
import { Button, Input } from '@/shared/ui';
import type { Ticket } from '@/shared/types';

interface OrderCreationFormProps {
  selectedTickets: Ticket[];
  onSubmit: (data: { clientFullName: string; clientPhone: string; clientBirthYear: number; region?: string }) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

const CURRENT_YEAR = new Date().getFullYear();
const STORAGE_KEY = 'last_client';

export const REGIONS = [
  { value: 'bishkek', label: 'г. Бишкек' },
  { value: 'batken', label: 'Баткенская область' },
  { value: 'jalal_abad', label: 'Джалал-Абадская область' },
  { value: 'issyk_kul', label: 'Иссык-Кульская область' },
  { value: 'naryn', label: 'Нарынская область' },
  { value: 'osh', label: 'Ошская область' },
  { value: 'talas', label: 'Таласская область' },
  { value: 'chuy', label: 'Чуйская область' },
] as const;

function loadSaved(): { fullName: string; phone: string; birthYear: string; region: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function OrderCreationForm({
  selectedTickets,
  onSubmit,
  onCancel,
  loading,
  error,
}: OrderCreationFormProps) {
  const [fullName, setFullName] = useState(() => loadSaved()?.fullName ?? '');
  const [phone, setPhone] = useState(() => loadSaved()?.phone ?? '');
  const [birthYear, setBirthYear] = useState(() => loadSaved()?.birthYear ?? '');
  const [region, setRegion] = useState(() => loadSaved()?.region ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = selectedTickets
    .reduce((s, t) => s + (t.tirageVariant ? t.tirageVariant.pricePerTicket : parseFloat(t.ticketPrice || t.price || '0')), 0)
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ fullName: fullName.trim(), phone: phone.trim(), birthYear, region }));
    } catch {}
    onSubmit({
      clientFullName: fullName.trim(),
      clientPhone: phone.trim(),
      clientBirthYear: parseInt(birthYear, 10),
      region: region || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selected tickets summary */}
      <div className="rounded-xl bg-slate-50 p-3 space-y-3 max-h-60 overflow-y-auto">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Выбранные билеты ({selectedTickets.length})</p>
        <div className="space-y-2">
          {selectedTickets.map((t) => (
            <div key={t.shortId} className="rounded-lg bg-white border border-slate-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-700">
                  {t.drawName} · {t.serial.split('-').slice(-2).join('-')}
                </span>
                <span className="text-xs font-semibold text-brand-blue">
                  {t.tirageVariant ? t.tirageVariant.pricePerTicket : t.ticketPrice} сом
                </span>
              </div>
              {t.tirageGrids && t.tirageGrids.length > 0 && (
                <div className="space-y-1.5">
                  {t.tirageGrids.map((grid) => (
                    <div key={grid.position} className="flex items-center gap-1.5">
                      {t.tirageGrids!.length > 1 && (
                        <span className="text-[10px] text-slate-400 w-3 shrink-0">{grid.position}</span>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {grid.numbers.map((num) => (
                          <div
                            key={num}
                            className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00C304] text-white text-xs font-black shadow-[inset_0px_2px_4px_0px_#009A03] shrink-0"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-600">Регион</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
        >
          <option value="">— Не выбран —</option>
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
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
