import TextInputArea from '@/components/TextInputArea';
import { CopyButton } from '@/components/CopyButton';
import SwitchButtonGroup from '@/components/SwitchButtonGroup';
import { Button } from '@/components/ui/button';
import { useTextMode } from '../useTextMode';

interface TextModeProps {
  onSwitchToImageMode?: () => void;
}

export default function TextMode({ onSwitchToImageMode }: TextModeProps) {
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
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-1">
      <SwitchButtonGroup
        value={direction}
        options={[
          { value: 'encode', label: '编码' },
          { value: 'decode', label: '解码' },
        ]}
        onChange={handleDirectionChange}
        size="small"
        className="w-full shrink-0"
      />

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <TextInputArea
          placeholder={placeholder}
          value={input}
          onChange={setInput}
          externalError={error || undefined}
          showClear={true}
          allowCopy={true}
          fill
          minRows={4}
          onClear={handleClear}
          className="min-h-0 flex-1"
        />

        {showImageHint && (
          <div className="flex shrink-0 items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/10 p-2.5">
            <span className="text-xs font-semibold tracking-tight text-primary">
              检测到图片的 data URI，请使用「图像」选项卡进行解码。
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSwitchToImageMode}
              className="h-7 shrink-0 rounded-md px-2.5 text-xs font-bold text-primary hover:bg-primary/20 hover:text-primary dark:hover:bg-primary/10"
            >
              切换到图像模式
            </Button>
          </div>
        )}

        {output && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-input bg-background shadow-sm">
            <div className="flex h-8 shrink-0 items-center px-4">
              <span className="select-none text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
                {outputLabel}
              </span>
            </div>
            <TextInputArea
              readOnly
              borderless
              fill
              showClear={false}
              value={output}
              className="min-h-0 flex-1"
            />
            <div className="flex h-10 shrink-0 items-center justify-end gap-1.5 border-t border-border/50 bg-muted/30 px-4">
              <CopyButton
                text={output}
                tooltip="复制结果"
                variant="ghost"
                size="iconSm"
                className="text-muted-foreground hover:text-foreground"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
