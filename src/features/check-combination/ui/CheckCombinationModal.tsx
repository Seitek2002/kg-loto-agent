'use client';

import { useState } from 'react';
import { Modal, Button, Input } from '@/shared/ui';
import { checkCombination, CombinationCheckResult } from '@/shared/api/agent';
import { ApiError } from '@/shared/api/client';

interface CheckCombinationModalProps {
  open: boolean;
  onClose: () => void;
}

export function CheckCombinationModal({ open, onClose }: CheckCombinationModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CombinationCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setCode('');
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await checkCombination(code.trim());
      setResult(res);
    } catch (err) {
      const detail =
        err instanceof ApiError && err.status === 404
          ? 'Комбинация не найдена'
          : 'Не удалось проверить билет. Попробуйте ещё раз.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Проверить билет">
      {result ? (
        <div className="flex flex-col items-center text-center gap-3">
          {result.isWinning ? (
            <>
              <div className="rounded-full bg-green-50 border border-green-200 px-4 py-3">
                <p className="text-sm font-semibold text-green-700">Билет выигрышный!</p>
                <p className="text-lg font-bold text-green-800 mt-1">
                  {result.prizeAmount ? `${result.prizeAmount} сом` : result.prizeProduct}
                </p>
              </div>
              {result.message && <p className="text-sm text-slate-500">{result.message}</p>}
            </>
          ) : (
            <div className="rounded-full bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-600">
                {result.message || 'Билет не выиграл'}
              </p>
            </div>
          )}
          <Button variant="ghost" onClick={reset} className="mt-2">
            Проверить другой билет
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Код комбинации"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Например: YT2357912"
            autoFocus
            required
          />
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={handleClose} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" variant="primary" loading={loading} className="flex-1">
              Проверить
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
