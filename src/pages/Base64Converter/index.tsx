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
    <div className="p-4 w-full flex flex-col space-y-4 min-h-[520px] select-none">
      <SwitchButtonGroup
        value={pageMode}
        options={[
          { value: 'text', label: '文本' },
          { value: 'file', label: '文件' },
          { value: 'image', label: '图像' },
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
