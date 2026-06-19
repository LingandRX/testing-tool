import TextInputArea from '@/components/TextInputArea';
import JwtResultView from './components/JwtResultView';
import { JWT_INPUT_PLACEHOLDER } from './constants';
import { useJwt } from './useJwt';

export default function Index() {
  const { jwtInput, result, handleChange, handleClear } = useJwt();

  return (
    <div className="p-4 w-full flex flex-col gap-4 select-none">
      <TextInputArea
        minRows={5}
        maxRows={10}
        placeholder={JWT_INPUT_PLACEHOLDER}
        value={jwtInput}
        onChange={handleChange}
        allowCopy={true}
        showClear={true}
        externalError={result?.error || undefined}
        onClear={handleClear}
      />

      {result && !result.error && <JwtResultView result={result} />}
    </div>
  );
}
