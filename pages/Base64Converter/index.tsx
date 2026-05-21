import { Type, Upload, Image } from 'lucide-react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import PageHeader from '@/components/PageHeader';
import { base64ConverterPageStyles } from '@/config/pageTheme';
import { useStorageState } from '@/utils/useStorageState';
import type { Base64ConverterPageMode } from '@/types/storage';
import TextMode from './TextMode';
import FileMode from './FileMode';
import ImageMode from './ImageMode';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';

const VALID_PAGE_MODES: readonly Base64ConverterPageMode[] = ['text', 'file', 'image'];

const isValidPageMode = (val: unknown): val is Base64ConverterPageMode =>
  typeof val === 'string' && (VALID_PAGE_MODES as readonly string[]).includes(val);

type PageMode = Base64ConverterPageMode;

export default function Index() {
  const { t } = useLazyTranslation('base64Converter');
  const [pageMode, setPageMode] = useStorageState(
    'base64Converter/pageMode',
    'text',
    isValidPageMode,
  );

  const modeIcon: Record<PageMode, React.ReactNode> = {
    text: <Type />,
    file: <Upload />,
    image: <Image />,
  };

  return (
    <div>
      <div className="p-2">
        <PageHeader
          title={t('base64Converter:pageTitle')}
          subtitle={t('base64Converter:pageSubtitle')}
          icon={modeIcon[pageMode]}
          iconColor={base64ConverterPageStyles.primaryColor}
        />

        <div className="flex flex-col gap-6">
          <SwitchButtonGroup
            value={pageMode}
            options={[
              { value: 'text', label: t('base64Converter:textMode') },
              { value: 'file', label: t('base64Converter:fileMode') },
              { value: 'image', label: t('base64Converter:imageMode') },
            ]}
            onChange={(value: PageMode) => setPageMode(value)}
            size="small"
          />

          {pageMode === 'text' && <TextMode onSwitchToImageMode={() => setPageMode('image')} />}
          {pageMode === 'file' && <FileMode />}
          {pageMode === 'image' && <ImageMode />}
        </div>
      </div>
    </div>
  );
}
