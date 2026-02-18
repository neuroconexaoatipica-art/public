import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { X, Activity, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'ok' | 'fail';
  ms?: number;
  detail?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ieieohtnaymykxiqnmlc.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaWVvaHRuYXlteWt4aXFubWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTQ1NzMsImV4cCI6MjA4NjA3MDU3M30.32LjQe1dQLGAfbyfK8KkjNlXOGkZGaWEgI20y3gl3Hc';

export function SupabaseDiag() {
  const [isOpen, setIsOpen] = useState(false);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const update = (name: string, patch: Partial<TestResult>) => {
    setTests(prev => prev.map(t => t.name === name ? { ...t, ...patch } : t));
  };

  const runDiag = async () => {
    setRunning(true);
    const initial: TestResult[] = [
      { name: '1. DNS/Rede', status: 'pending' },
      { name: '2. REST API (fetch)', status: 'pending' },
      { name: '3. Auth getSession', status: 'pending' },
      { name: '4. Auth getUser', status: 'pending' },
      { name: '5. SELECT users', status: 'pending' },
      { name: '6. SELECT communities', status: 'pending' },
      { name: '7. SELECT posts', status: 'pending' },
      { name: '8. INSERT post (dry)', status: 'pending' },
    ];
    setTests(initial);

    // 1
    update('1. DNS/Rede', { status: 'running' });
    try {
      const t0 = performance.now();
      const r = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: { apikey: SUPABASE_KEY },
        signal: AbortSignal.timeout(10000),
      });
      const ms = Math.round(performance.now() - t0);
      update('1. DNS/Rede', {
        status: r.ok || r.status === 400 ? 'ok' : 'fail',
        ms,
        detail: `HTTP ${r.status} em ${ms}ms`
      });
    } catch (e: any) {
      update('1. DNS/Rede', { status: 'fail', detail: e.message });
    }

    // 2
    update('2. REST API (fetch)', { status: 'running' });
    try {
      const t0 = performance.now();
      const r = await fetch(`${SUPABASE_URL}/rest/v1/communities?select=id&limit=1`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        signal: AbortSignal.timeout(12000),
      });
      const ms = Math.round(performance.now() - t0);
      const body = await r.text();
      update('2. REST API (fetch)', {
        status: r.ok ? 'ok' : 'fail',
        ms,
        detail: `HTTP ${r.status} (${ms}ms) ${body.substring(0, 120)}`
      });
    } catch (e: any) {
      update('2. REST API (fetch)', { status: 'fail', detail: e.message });
    }

    // 3
    update('3. Auth getSession', { status: 'running' });
    try {
      const t0 = performance.now();
      const { data, error } = await supabase.auth.getSession();
      const ms = Math.round(performance.now() - t0);
      if (error) throw error;
      const uid = data.session?.user?.id;
      update('3. Auth getSession', {
        status: uid ? 'ok' : 'fail',
        ms,
        detail: uid ? `uid: ${uid.substring(0, 8)}... (${ms}ms)` : `Sem sessao (${ms}ms)`
      });
    } catch (e: any) {
      update('3. Auth getSession', { status: 'fail', detail: e.message });
    }

    // 4
    update('4. Auth getUser', { status: 'running' });
    try {
      const t0 = performance.now();
      const { data, error } = await supabase.auth.getUser();
      const ms = Math.round(performance.now() - t0);
      if (error) throw error;
      update('4. Auth getUser', {
        status: data.user ? 'ok' : 'fail',
        ms,
        detail: data.user
          ? `email: ${data.user.email} (${ms}ms)`
          : `Sem user (${ms}ms)`
      });
    } catch (e: any) {
      update('4. Auth getUser', { status: 'fail', detail: e.message });
    }

    // 5
    update('5. SELECT users', { status: 'running' });
    try {
      const t0 = performance.now();
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        update('5. SELECT users', { status: 'fail', detail: 'Sem sessao ativa' });
      } else {
        const { data, error } = await supabase
          .from('users')
          .select('id, role, name')
          .eq('id', uid)
          .single();
        const ms = Math.round(performance.now() - t0);
        if (error) throw error;
        update('5. SELECT users', {
          status: 'ok',
          ms,
          detail: `role=${data.role}, name=${data.name} (${ms}ms)`
        });
      }
    } catch (e: any) {
      update('5. SELECT users', { status: 'fail', detail: e.message });
    }

    // 6
    update('6. SELECT communities', { status: 'running' });
    try {
      const t0 = performance.now();
      const { data, error } = await supabase
        .from('communities')
        .select('id, name')
        .limit(3);
      const ms = Math.round(performance.now() - t0);
      if (error) throw error;
      update('6. SELECT communities', {
        status: 'ok',
        ms,
        detail: `${data?.length || 0} comunidades (${ms}ms)`
      });
    } catch (e: any) {
      update('6. SELECT communities', { status: 'fail', detail: e.message });
    }

    // 7
    update('7. SELECT posts', { status: 'running' });
    try {
      const t0 = performance.now();
      const { data, error } = await supabase
        .from('posts')
        .select('id, content, author')
        .limit(1);
      const ms = Math.round(performance.now() - t0);
      if (error) throw error;
      update('7. SELECT posts', {
        status: 'ok',
        ms,
        detail: `${data?.length || 0} post(s) (${ms}ms)`
      });
    } catch (e: any) {
      update('7. SELECT posts', { status: 'fail', detail: e.message });
    }

    // 8
    update('8. INSERT post (dry)', { status: 'running' });
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) {
        update('8. INSERT post (dry)', { status: 'fail', detail: 'Sem token' });
      } else {
        const t0 = performance.now();
        const r = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${token}`,
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            content: '__DIAG_TEST__',
            author: sess.session!.user.id,
            is_public: false,
            community: null,
            image_url: null,
          }),
          signal: AbortSignal.timeout(15000),
        });
        const ms = Math.round(performance.now() - t0);
        const body = await r.text();

        if (r.ok) {
          try {
            const created = JSON.parse(body);
            const postId = Array.isArray(created) ? created[0]?.id : created?.id;
            if (postId) {
              await fetch(`${SUPABASE_URL}/rest/v1/posts?id=eq.${postId}`, {
                method: 'DELETE',
                headers: {
                  apikey: SUPABASE_KEY,
                  Authorization: `Bearer ${token}`,
                },
              });
            }
          } catch {}
          update('8. INSERT post (dry)', {
            status: 'ok',
            ms,
            detail: `INSERT OK, deletado (${ms}ms)`
          });
        } else {
          update('8. INSERT post (dry)', {
            status: 'fail',
            ms,
            detail: `HTTP ${r.status} (${ms}ms): ${body.substring(0, 200)}`
          });
        }
      }
    } catch (e: any) {
      update('8. INSERT post (dry)', { status: 'fail', detail: e.message });
    }

    setRunning(false);
  };

  const statusIcon = (s: TestResult['status']) => {
    switch (s) {
      case 'ok': return <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-400 shrink-0" />;
      case 'running': return <Loader2 className="h-4 w-4 text-yellow-400 animate-spin shrink-0" />;
      default: return <div className="h-4 w-4 rounded-full bg-white/20 shrink-0" />;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[100] p-3 bg-[#35363A] border border-white/20 rounded-full shadow-lg hover:bg-white/10 transition-colors"
        title="Diagnostico Supabase"
      >
        <Activity className="h-5 w-5 text-[#81D8D0]" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#81D8D0]" />
            Diagnostico Supabase
          </h3>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {tests.length === 0 && !running && (
            <p className="text-white/50 text-sm text-center py-4">
              Clique Executar para testar todas as camadas.
            </p>
          )}
          {tests.map((t, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
              {statusIcon(t.status)}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white">{t.name}</p>
                {t.detail && (
                  <p className="text-xs text-white/50 break-all mt-0.5">{t.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 flex gap-2">
          <button
            onClick={runDiag}
            disabled={running}
            className="flex-1 py-2.5 bg-[#81D8D0] text-black rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              'Executar Diagnostico'
            )}
          </button>
          <button
            onClick={() => { setTests([]); setIsOpen(false); }}
            className="px-4 py-2.5 bg-white/5 text-white/70 rounded-xl hover:bg-white/10"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
