'use client';

import { useState } from 'react';
import { Modal, Button, Input } from '@/shared/ui';
import { useAdminStore } from '@/features/admin/model/adminStore';

interface AddAgentModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddAgentModal({ open, onClose }: AddAgentModalProps) {
  const { createAgent, error } = useAdminStore();
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    commissionPercent: '5.00',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await createAgent(form);
    setLoading(false);
    if (ok) {
      setForm({ email: '', password: '', fullName: '', phoneNumber: '', commissionPercent: '5.00' });
      onClose();
    }
  };

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Добавить агента">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="ФИО агента"
          value={form.fullName}
          onChange={set('fullName')}
          required
          placeholder="Бекова Айгуль Сейткалиевна"
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={set('email')}
          required
          placeholder="agent@kgloto.kg"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Пароль"
            type="password"
            value={form.password}
            onChange={set('password')}
            required
            placeholder="••••••••"
          />
          <Input
            label="Комиссия (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={form.commissionPercent}
            onChange={set('commissionPercent')}
            required
            placeholder="5.00"
          />
        </div>
        <Input
          label="Телефон"
          type="tel"
          value={form.phoneNumber}
          onChange={set('phoneNumber')}
          required
          placeholder="996700000000"
          hint="В формате 996XXXXXXXXX"
        />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Отмена
          </Button>
          <Button type="submit" variant="primary" loading={loading} className="flex-1">
            Создать
          </Button>
        </div>
      </form>
    </Modal>
  );
}
