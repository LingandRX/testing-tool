import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

/**
 * 按钮属性类型
 * 继承自 MUI ButtonProps，支持所有 MUI Button 的属性
 */
export type ButtonProps = MuiButtonProps;

/**
 * Button - 自定义按钮组件
 *
 * 基于 MUI Button 的二次封装，提供统一的项目风格：
 * - 禁用阴影和涟漪效果
 * - 圆角设计 (borderRadius: 4)
 * - 固定高度和字体大小
 * - hover 时轻微上浮效果
 * - 支持 sx 数组合并
 *
 * @example
 * ```tsx
 * <Button variant="contained" color="primary">
 *   提交
 * </Button>
 * ```
 *
 * @param sx - 自定义样式，支持数组或单个样式对象
 * @param props - 其他 MUI Button 属性
 * @returns 按钮组件
 */
export function Button({ sx = [], ...props }: ButtonProps) {
  return (
    <MuiButton
      disableElevation
      disableRipple
      {...props}
      sx={[
        {
          py: 1.6,
          borderRadius: 4,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}

export default Button;
