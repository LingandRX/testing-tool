import DiffWorkspace from './components/DiffWorkspace';
import JsonFormatSection from './components/JsonFormatSection';
import JsonConvertSection from './components/JsonConvertSection';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { useJsonTools } from './useJsonTools';
import type { JsonToolsPageMode } from '@/types/storage';

type PageMode = JsonToolsPageMode;

export default function Index() {
  const tools = useJsonTools();
  const { pageMode, setPageMode, yamlConvert, tomlConvert, minifyConvert } = tools;

  return (
    <div className="flex h-full min-h-0 w-full select-none flex-col space-y-4 p-4">
      <SwitchButtonGroup
        value={pageMode}
        onChange={(v: PageMode) => setPageMode(v)}
        options={[
          { value: 'diff', label: '差异比较' },
          { value: 'format', label: '格式化' },
          { value: 'yaml', label: 'YAML' },
          { value: 'toml', label: 'TOML' },
          { value: 'minify', label: '压缩' },
        ]}
        size="small"
        className="w-full shrink-0 sm:w-auto"
      />

      {pageMode === 'diff' ? (
        <DiffWorkspace tools={tools} />
      ) : pageMode === 'format' ? (
        <JsonFormatSection tools={tools} />
      ) : pageMode === 'yaml' ? (
        <JsonConvertSection tools={tools} mode="yaml" convertFunction={yamlConvert} />
      ) : pageMode === 'toml' ? (
        <JsonConvertSection tools={tools} mode="toml" convertFunction={tomlConvert} />
      ) : (
        <JsonConvertSection tools={tools} mode="minify" convertFunction={minifyConvert} />
      )}
    </div>
  );
}
