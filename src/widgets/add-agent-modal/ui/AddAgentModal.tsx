'use client';

import { useState } from 'react';
import { Modal, Button, Input } from '@/shared/ui';
import { useAdminStore } from '@/features/admin/model/adminStore';

interface AddAgentModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddAgentModal({ open, onClose }: AddAgentModalProps) {
  const addAgent = useAdminStore((s) => s.addAgent);
  const [form, setForm] = useState({
    name: '',
    login: '',
    password: '',
    phone: '',
    whatsapp: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    addAgent(form);
    setLoading(false);
    setForm({ name: '', login: '', password: '', phone: '', whatsapp: '' });
    onClose();
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Добавить агента">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="ФИО агента" value={form.name} onChange={set('name')} required placeholder="Асанова Айгуль Бековна" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Логин" value={form.login} onChange={set('login')} required placeholder="agent4" />
          <Input label="Пароль" type="password" value={form.password} onChange={set('password')} required placeholder="••••••" />
        </div>
        <Input label="Телефон" type="tel" value={form.phone} onChange={set('phone')} required placeholder="+996 700 000 000" />
        <Input label="WhatsApp" type="tel" value={form.whatsapp} onChange={set('whatsapp')} required placeholder="+996700000000" hint="В международном формате без пробелов" />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Отмена</Button>
          <Button type="submit" variant="primary" loading={loading} className="flex-1">Создать</Button>
        </div>
      </form>
    </Modal>
  );
}
