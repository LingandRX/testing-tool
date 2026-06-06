/**
 * 生成器选择器组件
 * 以分类形式展示所有可用生成器
 */

import { useState } from 'react';
import { Search, User, Briefcase, Code, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/utils/chromeI18n';
import { generatorCategories, getGeneratorsByCategory, searchGenerators } from '@/lib/generators';

interface GeneratorSelectorProps {
  selectedId: string;
  onChange: (id: string) => void;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  personal: User,
  business: Briefcase,
  technical: Code,
  basic: Hash,
};

export default function GeneratorSelector({ selectedId, onChange }: GeneratorSelectorProps) {
  const { t } = useI18n('testDataGenerator');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(generatorCategories[0]?.id || '');

  const generators = searchQuery
    ? searchGenerators(searchQuery)
    : getGeneratorsByCategory(activeCategory);

  return (
    <div className="space-y-3">
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('testDataGenerator_searchGenerator')}
          className="pl-9 h-9"
        />
      </div>

      {/* 分类标签 */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-2">
          {generatorCategories.map((category) => {
            const Icon = categoryIcons[category.id];
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {category.name}
              </button>
            );
          })}
        </div>
      )}

      {/* 生成器列表 */}
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
        {generators.map((generator) => (
          <button
            key={generator.id}
            onClick={() => onChange(generator.id)}
            className={`flex flex-col items-start p-2 text-left rounded-md border transition-colors ${
              selectedId === generator.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <span className="text-sm font-medium text-foreground">{generator.name}</span>
            <span className="text-xs text-muted-foreground line-clamp-1">
              {generator.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
