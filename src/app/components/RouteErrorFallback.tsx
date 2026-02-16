import { useRouteError } from 'react-router';

export default function RouteErrorFallback() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : 'Unexpected route error';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6">
      <div className="max-w-xl w-full rounded-xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
        <h1 className="text-xl font-semibold text-white">페이지 로딩 오류</h1>
        <p className="text-sm text-slate-300 break-words">{message}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            새로고침
          </button>
          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-white text-sm"
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
