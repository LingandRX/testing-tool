import { stringifyJson } from '@/utils/jwt';
import type { JwtResult } from '@/utils/jwt';
import { cn } from '@/lib/utils';
import {
  JWT_JSON_CONTENT_CLASS,
  JWT_SECTION_CONFIG,
  JWT_SIGNATURE_SECTION,
  JWT_TEXT_CONTENT_CLASS,
} from '../constants';
import JwtCopyBlock from './JwtCopyBlock';

interface JwtResultViewProps {
  result: JwtResult;
}

export default function JwtResultView({ result }: JwtResultViewProps) {
  return (
    <div className="flex flex-col gap-4">
      {JWT_SECTION_CONFIG.map(({ contentKey, title, colorClass, bgClass, borderClass }) => {
        const content = result[contentKey];

        return (
          <JwtCopyBlock
            key={contentKey}
            title={title}
            copyText={JSON.stringify(content)}
            titleClassName={colorClass}
            containerClassName={cn('border-solid', bgClass, borderClass)}
          >
            <pre className={JWT_JSON_CONTENT_CLASS}>
              {content ? stringifyJson(content) : '无法解析'}
            </pre>
          </JwtCopyBlock>
        );
      })}

      <JwtCopyBlock
        title={JWT_SIGNATURE_SECTION.title}
        copyText={result.signature || ''}
        titleClassName={JWT_SIGNATURE_SECTION.titleClassName}
        containerClassName={JWT_SIGNATURE_SECTION.containerClassName}
      >
        <span className={JWT_TEXT_CONTENT_CLASS}>
          {result.signature || JWT_SIGNATURE_SECTION.emptyLabel}
        </span>
      </JwtCopyBlock>
    </div>
  );
}
