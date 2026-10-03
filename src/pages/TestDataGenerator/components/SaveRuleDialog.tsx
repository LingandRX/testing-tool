import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import * as ruleStorage from '@/utils/ruleStorage';
import type { FieldConfig } from '@/types/testDataGenerator';

export interface SaveRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: FieldConfig[];
  onSaved?: () => void;
}

export default function SaveRuleDialog({
  open,
  onOpenChange,
  fields,
  onSaved,
}: SaveRuleDialogProps) {
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');

  // 弹窗关闭时重置表单状态
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setRuleName('');
        setRuleDescription('');
        setShowConfirmOverwrite(false);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange],
  );

  const handleClose = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  const handleSave = useCallback(
    (overwrite = false) => {
      const trimmedName = ruleName.trim();
      if (!trimmedName) return;

      const existingRule = ruleStorage.getByName(trimmedName);

      // 检查名称是否重复
      if (!overwrite && existingRule) {
        setShowConfirmOverwrite(true);
        return;
      }

      const savedRule = ruleStorage.save(
        overwrite && existingRule
          ? {
              id: existingRule.id,
              name: trimmedName,
              description: ruleDescription.trim(),
              fields,
            }
          : {
              name: trimmedName,
              description: ruleDescription.trim(),
              fields,
            },
      );

      if (savedRule) {
        handleClose();
        toast.success(overwrite ? '规则已覆盖' : '规则已保存');
        onSaved?.();
      } else {
        toast.error('规则保存失败');
      }
    },
    [ruleName, ruleDescription, fields, handleClose, onSaved],
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100vw-4rem)] max-w-[420px] p-0 pt-6 flex flex-col"
        >
          <DialogTitle className="sr-only">保存规则</DialogTitle>
          <DialogDescription className="sr-only">保存当前字段配置为规则</DialogDescription>
          <div className="flex-1 overflow-y-auto px-6 pt-2 pb-4 space-y-4">
            <Input
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="规则名称"
              className="h-9"
            />
            <Input
              value={ruleDescription}
              onChange={(e) => setRuleDescription(e.target.value)}
              placeholder="规则描述（可选）"
              className="h-9"
            />
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t shrink-0">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              取消
            </Button>
            <Button size="sm" onClick={() => handleSave(false)} disabled={!ruleName.trim()}>
              确认
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmOverwrite} onOpenChange={setShowConfirmOverwrite}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100vw-4rem)] max-w-[420px] p-0 pt-6 flex flex-col"
        >
          <DialogTitle className="sr-only">覆盖确认</DialogTitle>
          <DialogDescription className="sr-only">确认是否覆盖同名规则</DialogDescription>
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <p className="text-sm text-muted-foreground">已存在同名规则，是否覆盖保存？</p>
          </div>
          <div className="flex justify-end gap-2 px-6 py-2 border-t shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setShowConfirmOverwrite(false)}>
              取消
            </Button>
            <Button size="sm" onClick={() => handleSave(true)}>
              覆盖
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
