import { useStorageState } from '@/utils/useStorageState';
import type { Base64ConverterPageMode } from '@/types/storage';
import TextMode from './components/TextMode';
import Base64ConverterSection from './components/Base64ConverterSection';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';

const VALID_PAGE_MODES: readonly Base64ConverterPageMode[] = ['text', 'file', 'image'];
const isValidPageMode = (val: unknown): val is Base64ConverterPageMode =>
  typeof val === 'string' && (VALID_PAGE_MODES as readonly string[]).includes(val);

type PageMode = Base64ConverterPageMode;

export default function Index() {
  const [pageMode, setPageMode] = useStorageState(
    'base64Converter/pageMode',
    'text',
    isValidPageMode,
  );

  return (
    <div className="flex h-full min-h-0 w-full max-w-[420px] flex-1 flex-col gap-2 overflow-hidden p-3 select-none">
      <SwitchButtonGroup
        value={pageMode}
        options={[
          { value: 'text', label: '文本' },
          { value: 'file', label: '文件' },
          { value: 'image', label: '图像' },
        ]}
        onChange={(value: PageMode) => setPageMode(value)}
        size="small"
        className="w-full shrink-0"
      />

      <div key={pageMode} className="flex min-h-0 w-full flex-1 flex-col page-transition-enter">
        {pageMode === 'text' && <TextMode onSwitchToImageMode={() => setPageMode('image')} />}
        {pageMode === 'file' && <Base64ConverterSection mode="file" />}
        {pageMode === 'image' && <Base64ConverterSection mode="image" />}
      </div>
    </div>
  );
}
