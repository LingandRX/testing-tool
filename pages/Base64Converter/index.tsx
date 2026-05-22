import { Image as ImageIcon, Type, Upload } from 'lucide-react';
import { useLazyTranslation } from '@/utils/useLazyTranslation';
import PageHeader from '@/components/PageHeader';
import { base64ConverterPageStyles } from '@/config/pageTheme';
import { useStorageState } from '@/utils/useStorageState';
import type { Base64ConverterPageMode } from '@/types/storage';
import TextMode from './TextMode';
import Base64ConverterSection from './Base64ConverterSection'; // ✅ 正确对接全新的一体化大组件
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
    text: <Type className="h-4 w-4" />,
    file: <Upload className="h-4 w-4" />,
    image: <ImageIcon className="h-4 w-4" />,
  };

  return (
    <div className="p-4 w-full flex flex-col space-y-4 min-h-[520px] select-none animate-in fade-in duration-300">
      <PageHeader
        title={t('base64Converter:pageTitle')}
        subtitle={t('base64Converter:pageSubtitle')}
        icon={modeIcon[pageMode]}
        iconColor={base64ConverterPageStyles.primaryColor}
        className="pb-1"
      />

      <SwitchButtonGroup
        value={pageMode}
        options={[
          { value: 'text', label: t('base64Converter:textMode') },
          { value: 'file', label: t('base64Converter:fileMode') },
          { value: 'image', label: t('base64Converter:imageMode') },
        ]}
        onChange={(value: PageMode) => setPageMode(value)}
        size="small"
        className="w-full sm:w-auto"
      />

      <div className="w-full pt-1">
        {pageMode === 'text' && <TextMode onSwitchToImageMode={() => setPageMode('image')} />}
        {pageMode === 'file' && <Base64ConverterSection mode="file" />}
        {pageMode === 'image' && <Base64ConverterSection mode="image" />}
      </div>
    </div>
  );
}
