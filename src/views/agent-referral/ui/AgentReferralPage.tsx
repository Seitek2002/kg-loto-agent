'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { agentApi } from '@/shared/api/agent';
import { Badge } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/utils';
import type { ReferralPurchase, ReferralEarnings } from '@/shared/types';

const SITE_DOMAIN = 'https://kgloto.com';

export function AgentReferralPage() {
  const { user } = useAuthStore();
  const [earnings, setEarnings] = useState<ReferralEarnings | null>(null);
  const [purchases, setPurchases] = useState<ReferralPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralLink = user?.referralCode
    ? `${SITE_DOMAIN}/r/${user.referralCode}`
    : null;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      agentApi.referralEarnings().catch(() => null),
      agentApi.referralPurchases().catch(() => []),
    ]).then(([e, p]) => {
      setEarnings(e);
      setPurchases(p ?? []);
      setLoading(false);
    });
  }, []);

  const handleCopy = useCallback(async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [referralLink]);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5">
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Реферальные продажи</h1>
          <p className="text-sm text-slate-500">Покупки клиентов, пришедших по вашей ссылке</p>
        </div>

        {/* Referral link block */}
        {referralLink ? (
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Ваша реферальная ссылка</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate text-sm text-brand-blue font-mono bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                {referralLink}
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                {copied ? '✓ Скопировано' : 'Копировать'}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Поделитесь этой ссылкой с клиентами. Каждая покупка за баланс через неё принесёт вам бонус.
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 text-center">
            Реферальный код не назначен. Обратитесь к администратору.
          </div>
        )}

        {/* Earnings summary */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : earnings ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Заработано</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {Number(earnings.totalBonus).toLocaleString('ru-RU')} {earnings.currency}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Оборот клиентов</div>
              <div className="text-2xl font-bold text-brand-blue mt-1">
                {Number(earnings.paidPurchasesAmount).toLocaleString('ru-RU')}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Оплачено</div>
              <div className="text-3xl font-bold text-slate-700 mt-1">{earnings.paidPurchasesCount}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Ожидают оплаты</div>
              <div className="text-3xl font-bold text-amber-600 mt-1">{earnings.pendingPurchasesCount}</div>
            </div>
          </div>
        ) : null}

        {/* Commission banner */}
        {earnings && (
          <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-brand-blue/70 font-medium uppercase tracking-wide">Ваша комиссия с реферальных продаж</div>
              <div className="text-lg font-bold text-brand-blue mt-0.5">
                {earnings.commissionPercent}% от суммы каждой покупки
              </div>
            </div>
            <svg className="w-10 h-10 text-brand-blue/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        {/* Purchases table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">
              История реферальных покупок
              {purchases.length > 0 && (
                <span className="ml-2 text-slate-400 font-normal">({purchases.length})</span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <svg className="w-6 h-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Загрузка…
            </div>
          ) : purchases.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">Реферальных покупок пока нет</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-medium">Дата</th>
                    <th className="text-left px-4 py-3 font-medium">Телефон</th>
                    <th className="text-right px-4 py-3 font-medium">Сумма</th>
                    <th className="text-right px-4 py-3 font-medium">Ваш бонус</th>
                    <th className="text-left px-4 py-3 font-medium">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {formatDateTime(p.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-mono">
                        {p.guestPhone}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                        {Number(p.amount).toLocaleString('ru-RU')} {p.currency}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                        {p.status === 'paid' ? (
                          <span className="text-emerald-600">
                            +{Number(p.referralBonusAmount).toLocaleString('ru-RU')} {p.currency}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            p.status === 'paid' ? 'success' :
                            p.status === 'pending' ? 'warning' : 'danger'
                          }
                        >
                          {p.statusDisplay}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
