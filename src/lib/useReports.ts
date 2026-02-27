import { useState, useCallback } from 'react';
import { supabase } from './supabase';

export type ReportType = 'harassment' | 'hate_speech' | 'sexual_content' | 'child_safety' |
  'spam' | 'impersonation' | 'self_harm' | 'violence' | 'inappropriate_content' | 'privacy_violation' | 'other';

export const REPORT_TYPE_LABELS: Record<ReportType, { label: string; severity: string; icon: string }> = {
  child_safety:         { label: 'Protecao infantil / Pedofilia', severity: 'critical', icon: '🚨' },
  harassment:           { label: 'Assedio / Perseguicao', severity: 'high', icon: '⚠️' },
  hate_speech:          { label: 'Discurso de odio', severity: 'high', icon: '🚫' },
  sexual_content:       { label: 'Conteudo sexual nao-consentido', severity: 'high', icon: '🔞' },
  violence:             { label: 'Violencia / Ameaca', severity: 'high', icon: '💀' },
  self_harm:            { label: 'Autolesao / Suicidio', severity: 'high', icon: '🆘' },
  impersonation:        { label: 'Falsa identidade', severity: 'medium', icon: '🎭' },
  spam:                 { label: 'Spam / Propaganda', severity: 'low', icon: '📢' },
  inappropriate_content:{ label: 'Conteudo inadequado', severity: 'medium', icon: '👎' },
  privacy_violation:    { label: 'Violacao de privacidade', severity: 'medium', icon: '🔒' },
  other:                { label: 'Outro', severity: 'medium', icon: '📝' },
};

export function useReports() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = useCallback(async (params: {
    reportedUserId?: string;
    reportedContentId?: string;
    reportedContentType?: string;
    reportType: ReportType;
    description?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Nao autenticado' };

      const severity = params.reportType === 'child_safety' ? 'critical'
        : ['harassment', 'hate_speech', 'sexual_content', 'violence', 'self_harm'].includes(params.reportType) ? 'high'
        : 'medium';

      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_user_id: params.reportedUserId || null,
        reported_content_id: params.reportedContentId || null,
        reported_content_type: params.reportedContentType || null,
        report_type: params.reportType,
        severity,
        description: params.description || null,
      });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submitReport, isSubmitting };
}
