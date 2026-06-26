/**
 * 测试数据生成器 Web Worker
 * 在后台线程中执行数据生成，避免阻塞 UI
 */

import { getGeneratorById } from '@/lib/generators';
import type {
  FieldConfig,
  WorkerRequestMessage,
  GenerateResult,
  GenerateProgress,
} from '@/types/testDataGenerator';

/** 每生成 N 行让出一次事件循环，以便处理 cancel 消息 */
const YIELD_EVERY = 100;

// 生成结果缓存
let generatedData: Record<string, unknown>[] = [];
let isCancelled = false;

/**
 * Worker 消息处理器
 */
self.onmessage = async (e: MessageEvent<WorkerRequestMessage>) => {
  const data = e.data;
  const { type } = data;

  switch (type) {
    case 'start':
      isCancelled = false;
      await handleStart(data.payload);
      break;
    case 'cancel':
      isCancelled = true;
      break;
  }
};

/**
 * 处理开始生成消息
 */
async function handleStart(payload: {
  generationId: number;
  fields: FieldConfig[];
  count: number;
  csvMode: boolean;
}): Promise<void> {
  const { generationId, fields, count } = payload;
  generatedData = [];

  try {
    // 验证所有生成器是否存在
    for (const field of fields) {
      const generator = getGeneratorById(field.generatorId);
      if (!generator) {
        self.postMessage({
          type: 'error',
          generationId,
          payload: { error: `生成器 "${field.generatorId}" 不存在` },
        });
        return;
      }
    }

    const startTime = Date.now();
    const warnings: string[] = [];

    // 生成数据
    for (let i = 0; i < count; i++) {
      if (isCancelled) {
        self.postMessage({
          type: 'complete',
          generationId,
          payload: {
            success: false,
            error: '生成已取消',
          },
        });
        return;
      }

      const record: Record<string, unknown> = {};

      for (const field of fields) {
        const generator = getGeneratorById(field.generatorId);
        if (!generator) continue;

        // 空值率控制
        if (!field.required && Math.random() * 100 < field.nullRate) {
          record[field.name] = null;
          continue;
        }

        try {
          // 唯一性约束处理
          if (field.unique) {
            let value: string | undefined;
            const maxRetries = 100;
            let retryCount = 0;

            // 小数据量：随机生成 + 重试
            if (count <= 1000) {
              while (retryCount < maxRetries) {
                value = generator.generate(field.params);
                const isUnique = !generatedData.some((item) => item[field.name] === value);
                if (isUnique) break;
                retryCount++;
                value = undefined;
              }
            } else {
              // 大数据量：使用索引生成策略
              if (generator.generateAtIndex) {
                value = generator.generateAtIndex(field.params, i);
              } else {
                // 回退到随机生成
                value = generator.generate(field.params);
              }
            }

            if (value !== undefined) {
              record[field.name] = value;
            } else {
              warnings.push(`字段 "${field.name}" 第 ${i + 1} 行唯一值生成失败`);
              record[field.name] = generator.generate(field.params);
            }
          } else {
            record[field.name] = generator.generate(field.params);
          }
        } catch (error) {
          warnings.push(`字段 "${field.name}" 第 ${i + 1} 行生成错误: ${error}`);
          record[field.name] = null;
        }
      }

      generatedData.push(record);

      // 进度回调（每1000条）
      if ((i + 1) % 1000 === 0 || i === count - 1) {
        const progress: GenerateProgress = {
          progress: Math.round(((i + 1) / count) * 100),
          generated: i + 1,
          total: count,
          estimatedTimeLeft: Math.round(((Date.now() - startTime) / (i + 1)) * (count - i - 1)),
        };
        self.postMessage({ type: 'progress', generationId, payload: progress });
      }

      // 定期让出事件循环，使 cancel 消息能被处理
      if ((i + 1) % YIELD_EVERY === 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        if (isCancelled) {
          self.postMessage({
            type: 'complete',
            generationId,
            payload: {
              success: false,
              error: '生成已取消',
            },
          });
          return;
        }
      }
    }

    const duration = Date.now() - startTime;
    const successCount = generatedData.filter((item) => Object.keys(item).length > 0).length;

    const result: GenerateResult = {
      success: true,
      data: generatedData,
      warnings: warnings.length > 0 ? warnings : undefined,
      stats: {
        total: count,
        success: successCount,
        failed: count - successCount,
        duration,
      },
    };

    self.postMessage({ type: 'complete', generationId, payload: result });
  } catch (error) {
    self.postMessage({
      type: 'error',
      generationId,
      payload: { error: `生成失败: ${error}` },
    });
  }
}
