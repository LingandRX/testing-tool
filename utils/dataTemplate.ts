/**
 * 数据模板管理工具
 * 用于创建、编辑、保存和管理自定义测试数据模板
 */

import { FieldType } from './dummyDataGenerator';

/**
 * 模板字段接口
 */
export interface TemplateField {
  id: string;
  name: string;
  label: string;
  fieldType: FieldType;
  defaultValue: string;
  rules: TemplateRule[];
}

/**
 * 模板规则接口
 */
export interface TemplateRule {
  type: 'required' | 'pattern' | 'minLength' | 'maxLength' | 'min' | 'max' | 'custom';
  value: string | number;
  message?: string;
}

/**
 * 数据模板接口
 */
export interface DataTemplate {
  id: string;
  name: string;
  description: string;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 模板存储键名
 */
const TEMPLATE_STORAGE_KEY = 'dataTemplates';

/**
 * 数据模板管理类
 */
export class DataTemplateManager {
  /**
   * 获取所有模板
   */
  static async getAllTemplates(): Promise<DataTemplate[]> {
    try {
      const stored = await chrome.storage.local.get(TEMPLATE_STORAGE_KEY);
      return (stored[TEMPLATE_STORAGE_KEY] as DataTemplate[]) || [];
    } catch (error) {
      console.error('获取模板失败:', error);
      return [];
    }
  }

  /**
   * 保存模板
   */
  static async saveTemplate(template: DataTemplate): Promise<boolean> {
    try {
      const templates = await this.getAllTemplates();
      const existingIndex = templates.findIndex((t) => t.id === template.id);

      if (existingIndex >= 0) {
        templates[existingIndex] = {
          ...template,
          updatedAt: new Date().toISOString(),
        };
      } else {
        templates.push({
          ...template,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      await chrome.storage.local.set({ [TEMPLATE_STORAGE_KEY]: templates });
      return true;
    } catch (error) {
      console.error('保存模板失败:', error);
      return false;
    }
  }

  /**
   * 删除模板
   */
  static async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const templates = await this.getAllTemplates();
      const filtered = templates.filter((t) => t.id !== templateId);
      await chrome.storage.local.set({ [TEMPLATE_STORAGE_KEY]: filtered });
      return true;
    } catch (error) {
      console.error('删除模板失败:', error);
      return false;
    }
  }

  /**
   * 导出模板
   */
  static exportTemplates(templates: DataTemplate[]): string {
    return JSON.stringify(templates, null, 2);
  }

  /**
   * 导入模板
   */
  static async importTemplates(jsonString: string): Promise<boolean> {
    try {
      const importedTemplates = JSON.parse(jsonString) as DataTemplate[];
      if (!Array.isArray(importedTemplates)) {
        return false;
      }

      const existingTemplates = await this.getAllTemplates();
      const mergedTemplates = [...existingTemplates];

      for (const template of importedTemplates) {
        const existingIndex = mergedTemplates.findIndex((t) => t.id === template.id);
        if (existingIndex >= 0) {
          mergedTemplates[existingIndex] = template;
        } else {
          mergedTemplates.push(template);
        }
      }

      await chrome.storage.local.set({ [TEMPLATE_STORAGE_KEY]: mergedTemplates });
      return true;
    } catch (error) {
      console.error('导入模板失败:', error);
      return false;
    }
  }

  /**
   * 生成唯一ID
   */
  static generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建空模板
   */
  static createEmptyTemplate(name: string, description: string = ''): DataTemplate {
    return {
      id: this.generateId(),
      name,
      description,
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
