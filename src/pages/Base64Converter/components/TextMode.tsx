import TextInputArea from '@/components/TextInputArea';
import { CopyButton } from '@/components/CopyButton';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { Button } from '@/components/ui/button';
import { useTextMode } from '../useTextMode';

interface TextModeProps {
  onSwitchToImageMode?: () => void;
}

export default function TextMode({ onSwitchToImageMode }: TextModeProps = {}) {
  const {
    input,
    setInput,
    direction,
    handleDirectionChange,
    placeholder,
    output,
    outputLabel,
    error,
    showImageHint,
    handleClear,
  } = useTextMode();

  return (
    <div className="w-full flex flex-col space-y-4 px-2">
      <div className="flex h-11 items-center px-1.5 bg-secondary/40 rounded-xl border border-border/60 w-fit">
        <SwitchButtonGroup
          value={direction}
          options={[
            { value: 'encode', label: '编码' },
            { value: 'decode', label: '解码' },
          ]}
          onChange={handleDirectionChange}
          size="small"
        />
      </div>

      <TextInputArea
        placeholder={placeholder}
        value={input}
        onChange={setInput}
        externalError={error || undefined}
        showClear={true}
        allowCopy={true}
        minRows={5}
        maxRows={10}
        onClear={handleClear}
      />

      {showImageHint && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary/10 border border-primary/20">
          <span className="text-xs font-semibold text-primary tracking-tight">
            检测到图片的 data URI，请使用「图像」选项卡进行解码。
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSwitchToImageMode}
            className="h-7 rounded-md text-xs font-bold text-primary hover:text-primary hover:bg-primary/20 dark:hover:bg-primary/10 px-2.5"
          >
            切换到图像模式
          </Button>
        </div>
      )}

      {output && (
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col space-y-3">
          <div className="flex justify-between items-center select-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
              {outputLabel}
            </span>
            <CopyButton
              text={output}
              className="h-6 px-2 rounded-md border text-[10px] font-bold"
            />
          </div>

          <TextInputArea
            readOnly
            value={output.length > 2000 ? `${output.substring(0, 2000)}...` : output}
            showClear={false}
            minRows={4}
          />
        </div>
      )}
    </div>
  );
}
