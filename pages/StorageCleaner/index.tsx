import { Loader2 } from 'lucide-react'; // 引入标准的高级阻尼 Spinner 图标
import { Button } from '@/components/ui/button';
import StorageCleanerConfirm from '@/pages/StorageCleaner/StorageCleanerConfirm';
import { useStorageCleaner } from './useStorageCleaner';
import StorageOptionsGrid from './StorageOptionsGrid';
import AutoRefreshToggle from './AutoRefreshToggle';
import ErrorDisplay from './ErrorDisplay';
import CleaningResult from './CleaningResult';
import { useLazyTranslation } from '@/utils/useLazyTranslation';

export default function Index() {
  const { t } = useLazyTranslation('storageCleaner');

  // 1. 完美对接全新重构、无需回调参数的纯净版状态 Hook
  const {
    error,
    isInitializing,
    options,
    sizes,
    autoRefresh,
    loading,
    result,
    showConfirm,
    setShowConfirm,
    allSelected,
    someSelected,
    handleAutoRefreshChange,
    handleOptionChange,
    handleSelectAll,
    handleClean,
  } = useStorageCleaner();

  // 计算当前的按钮锁定状态：没有任何一项被勾选，或者正在清理中，则禁用大按钮
  const isButtonDisabled = !(someSelected || allSelected) || loading;

  // 2. 初始化骨架屏：全面升级为符合 shadcn 规范的无损微动效 Spinner
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[280px] w-full animate-in fade-in duration-200">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/80" />
        <span className="text-xs text-muted-foreground mt-2 font-medium tracking-wide">
          正在读取站点数据...
        </span>
      </div>
    );
  }

  // 拦截非法域名或受限域名的错误提示页（ErrorDisplay 内部已在上一轮做好 p-4 居中）
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    /* 3. 终极版页面根容器：
      - 彻底灌入 p-4，全局对齐线向内收缩 16px，终结贴边惨剧。
      - 用 space-y-3.5 替代块级外边距（mb-3 等），让所有卡片之间的垂直间距处于绝对一致的黄金比例。
    */
    <div className="p-4 w-full flex flex-col space-y-3.5 animate-in fade-in duration-300">
      {/* 存储网格核心中控面板 (内部已满血复活半选状态) */}
      <StorageOptionsGrid
        options={options}
        sizes={sizes}
        allSelected={allSelected}
        someSelected={someSelected}
        onOptionChange={handleOptionChange}
        onSelectAll={handleSelectAll}
      />

      {/* 自动刷新开关 */}
      <AutoRefreshToggle autoRefresh={autoRefresh} onChange={handleAutoRefreshChange} />

      {/* 4. 主行动按钮超进化：
        - 彻底剥离 bg-amber-500，全面回归系统标准的 variant="destructive"。
        - 享受高风险操作该有的危险红警示，完美契合上一轮重构的二次确认弹窗基调。
        - 高级动态加载：当处于 cleaning 状态时，文字自动流转，且左侧自动淡入等宽 Loader2 图标。
      */}
      <Button
        variant="destructive"
        size="default"
        onClick={() => setShowConfirm(true)}
        disabled={isButtonDisabled}
        className="w-full h-10 font-bold shadow-sm text-sm tracking-wide transition-all active:scale-[0.99]"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('storageCleaner:cleaning')}
          </>
        ) : (
          t('storageCleaner:cleanNow')
        )}
      </Button>

      {/* 动态清理结果返回反馈卡片 */}
      <CleaningResult result={result} />

      {/* 二次风险防御确认弹窗 */}
      <StorageCleanerConfirm
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClean}
        options={options}
      />
    </div>
  );
}
