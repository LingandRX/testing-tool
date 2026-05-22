import { useCallback, useMemo, useState } from 'react';
import { Key } from 'lucide-react';
import { useSnackbar } from '@/components/GlobalSnackbar';
import PageHeader from '@/components/PageHeader';
import { stringifyJson, parseJwt } from '@/utils/jwt';
import CopyButton from '@/components/CopyButton';
import TextInputArea from '@/components/TextInputArea';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import { useContextMenuData } from '@/utils/useContextMenuData';

interface SectionProps {
  title: string;
  content: unknown;
  color: string;
}

const Section = ({ title, content, color }: SectionProps) => {
  const { t } = useLazyTranslation('jwt');
  return (
    <div
      className="p-4 rounded-xl border relative"
      style={{
        borderColor: `${color}40`,
        backgroundColor: `${color}05`,
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold tracking-wide" style={{ color }}>
          {title}
        </span>
        <div className="flex gap-1">
          <CopyButton text={JSON.stringify(content)} size="small" />
        </div>
      </div>
      <pre className="m-0 p-3 bg-background/60 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all border border-black/5">
        {content ? stringifyJson(content) : t('jwt:invalidFormat')}
      </pre>
    </div>
  );
};

export default function Index() {
  const { showMessage } = useSnackbar();
  const { t } = useLazyTranslation('jwt');
  const [jwtInput, setJwtInput] = useState('');

  const handleContextMenuData = useCallback((payload: string) => {
    const cleaned = payload.replace(/^Bearer\s*/i, '').trim();
    setJwtInput(cleaned);
  }, []);

  useContextMenuData({ featureKey: 'jwt', onData: handleContextMenuData });

  const result = useMemo(() => {
    if (!jwtInput.trim()) {
      return null;
    }
    return parseJwt(jwtInput);
  }, [jwtInput]);

  return (
    <div>
      <div className="p-2">
        <PageHeader title={t('jwt:pageTitle')} subtitle={t('jwt:pageSubtitle')} icon={<Key />} />

        <div className="flex flex-col gap-6">
          {/* Input Area */}
          <TextInputArea
            minRows={4}
            placeholder={t('jwt:placeholder')}
            value={jwtInput}
            onChange={(val) => {
              const cleaned = val.replace(/^Bearer\s*/i, '').trim();
              setJwtInput(cleaned);
            }}
            allowCopy={true}
            showClear={true}
            showMessage={showMessage}
            externalError={result?.error}
          />

          {result && !result.error && (
            <div className="flex flex-col gap-4">
              <Section
                title={t('jwt:headerTitle')}
                content={result.header}
                color="#fb015b" // JWT.io Header Color
              />
              <Section
                title={t('jwt:payloadTitle')}
                content={result.payload}
                color="#d63aff" // JWT.io Payload Color
              />
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold tracking-wide text-primary">
                    {t('jwt:signatureTitle')}
                  </span>
                  <CopyButton text={JSON.stringify(result.raw.signature)} size="small" />
                </div>
                <span className="block text-sm font-mono break-all text-muted-foreground bg-background/60 p-3 rounded-lg border border-black/5">
                  {result.signature || t('jwt:noSignature')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
