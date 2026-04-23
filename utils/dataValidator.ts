/**
 * 数据验证工具
 * 用于在数据填充前进行格式验证
 */

import { FieldType } from './dummyDataGenerator';

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 数据验证工具类
 */
export class DataValidator {
  /**
   * 验证邮箱格式
   */
  private static validateEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  /**
   * 验证手机号格式（中国大陆）
   */
  private static validatePhone(value: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(value);
  }

  /**
   * 验证身份证号格式（中国大陆）
   */
  private static validateIdCard(value: string): boolean {
    const idCardRegex =
      /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
    return idCardRegex.test(value);
  }

  /**
   * 验证日期格式
   */
  private static validateDate(value: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  /**
   * 验证数字格式
   */
  private static validateNumber(value: string): boolean {
    return !isNaN(Number(value)) && value.trim() !== '';
  }

  /**
   * 验证字段值
   */
  static validateField(fieldType: FieldType, value: string): ValidationResult {
    const errors: string[] = [];

    switch (fieldType) {
      case FieldType.EMAIL:
        if (!this.validateEmail(value)) {
          errors.push('邮箱格式不正确');
        }
        break;
      case FieldType.PHONE:
        if (!this.validatePhone(value)) {
          errors.push('手机号格式不正确，应为11位数字');
        }
        break;
      case FieldType.ID_CARD:
        if (!this.validateIdCard(value)) {
          errors.push('身份证号格式不正确');
        }
        break;
      case FieldType.DATE:
        if (!this.validateDate(value)) {
          errors.push('日期格式不正确，应为YYYY-MM-DD');
        }
        break;
      case FieldType.NUMBER:
        if (!this.validateNumber(value)) {
          errors.push('数字格式不正确');
        }
        break;
      case FieldType.NAME:
        if (value.length < 2 || value.length > 50) {
          errors.push('姓名长度应在2-50个字符之间');
        }
        break;
      case FieldType.PASSWORD:
        if (value.length < 6) {
          errors.push('密码长度不能少于6个字符');
        }
        break;
      case FieldType.TEXT:
      case FieldType.TEXTarea:
        if (value.length > 10000) {
          errors.push('文本长度不能超过10000个字符');
        }
        break;
      default:
        // 未知类型不做验证
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 批量验证字段
   */
  static validateFields(fields: Array<{ fieldType: FieldType; value: string }>): ValidationResult {
    const allErrors: string[] = [];

    fields.forEach((field, index) => {
      const result = this.validateField(field.fieldType, field.value);
      if (!result.isValid) {
        allErrors.push(`字段 ${index + 1}: ${result.errors.join(', ')}`);
      }
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  /**
   * 获取字段类型的验证规则描述
   */
  static getValidationRules(fieldType: FieldType): string[] {
    switch (fieldType) {
      case FieldType.EMAIL:
        return ['格式: user@domain.com'];
      case FieldType.PHONE:
        return ['格式: 11位中国大陆手机号', '以1开头，第二位为3-9'];
      case FieldType.ID_CARD:
        return ['格式: 18位身份证号', '前6位为地区码', '中间8位为生日', '最后1位为校验码'];
      case FieldType.DATE:
        return ['格式: YYYY-MM-DD', '例如: 2024-01-01'];
      case FieldType.NUMBER:
        return ['格式: 整数或浮点数'];
      case FieldType.NAME:
        return ['长度: 2-50个字符'];
      case FieldType.PASSWORD:
        return ['长度: 至少6个字符'];
      case FieldType.TEXT:
      case FieldType.TEXTarea:
        return ['长度: 不超过10000个字符'];
      default:
        return [];
    }
  }
}
