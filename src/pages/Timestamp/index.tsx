import { cn } from '@/lib/utils';
import LiveClock from './components/LiveClock';
import ConverterForm from './components/ConverterForm';
import ResultView from './components/ResultView';
import { CARD_CLASS } from './constants';
import { useTimestampConverter } from './useTimestampConverter';

export default function Index() {
  const { result, handleUseNow, ...formProps } = useTimestampConverter();

  return (
    <div className="p-4 w-full flex flex-col space-y-4 select-none">
      <LiveClock unit={formProps.unit} onUseNow={handleUseNow} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        <ConverterForm {...formProps} />

        <div className={cn(CARD_CLASS, 'h-full')}>
          <ResultView result={result} showEmptyPlaceholder />
        </div>
      </div>
    </div>
  );
}
