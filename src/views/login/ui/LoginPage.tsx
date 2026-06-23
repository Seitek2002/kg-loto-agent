import { LoginForm } from '@/features/auth/ui/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-yellow shadow-lg mb-4">
            <span className="text-2xl font-black text-brand-dark">KG</span>
          </div>
          <h1 className="text-2xl font-bold text-white">KGLOTO.Агент</h1>
          <p className="text-blue-300 text-sm mt-1">Система продажи лотерейных билетов</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Вход в систему</h2>
          <LoginForm />
        </div>

        <p className="text-center text-blue-300/60 text-xs mt-6">
          © 2026 ОсОО «Кей Джи Лотерея»
        </p>
      </div>
    </div>
  );
}
