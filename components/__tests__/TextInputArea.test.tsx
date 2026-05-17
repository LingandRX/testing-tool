import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import TextInputArea from '@/components/TextInputArea';

describe('TextInputArea 组件', () => {
  describe('基础渲染', () => {
    it('应渲染 placeholder', () => {
      render(<TextInputArea placeholder="请输入文本..." />);
      expect(screen.getByPlaceholderText('请输入文本...')).toBeInTheDocument();
    });

    it('应渲染传入的 value', () => {
      render(<TextInputArea value="测试内容" onChange={() => {}} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('测试内容');
    });

    it('默认显示清空按钮', () => {
      render(<TextInputArea value="有内容" onChange={() => {}} />);
      expect(screen.getByTitle('清空')).toBeInTheDocument();
    });

    it('无内容时清空按钮应隐藏', () => {
      render(<TextInputArea value="" onChange={() => {}} />);
      expect(screen.queryByTitle('清空')).not.toBeInTheDocument();
    });

    it('disabled 时清空按钮应隐藏', () => {
      render(<TextInputArea value="内容" onChange={() => {}} disabled />);
      expect(screen.queryByTitle('清空')).not.toBeInTheDocument();
    });

    it('readOnly 时清空按钮应隐藏', () => {
      render(<TextInputArea value="内容" onChange={() => {}} readOnly />);
      expect(screen.queryByTitle('清空')).not.toBeInTheDocument();
    });

    it('showClear=false 时不显示清空按钮', () => {
      render(<TextInputArea value="内容" onChange={() => {}} showClear={false} />);
      expect(screen.queryByTitle('清空')).not.toBeInTheDocument();
    });
  });

  describe('受控模式', () => {
    it('输入时触发 onChange', () => {
      const handleChange = vi.fn();
      render(<TextInputArea value="" onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '新内容' } });

      expect(handleChange).toHaveBeenCalledWith('新内容');
    });

    it('清空按钮触发 onChange("")', () => {
      const handleChange = vi.fn();
      render(<TextInputArea value="内容" onChange={handleChange} />);

      fireEvent.click(screen.getByTitle('清空'));

      expect(handleChange).toHaveBeenCalledWith('');
    });
  });

  describe('非受控模式', () => {
    it('defaultValue 应显示初始值', () => {
      render(<TextInputArea defaultValue="初始值" />);
      expect(screen.getByRole('textbox')).toHaveValue('初始值');
    });

    it('输入后应更新内部值', () => {
      render(<TextInputArea defaultValue="" />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '新内容' } });

      expect(textarea).toHaveValue('新内容');
    });

    it('清空按钮应清空内容', () => {
      render(<TextInputArea defaultValue="内容" />);

      fireEvent.click(screen.getByTitle('清空'));

      expect(screen.getByRole('textbox')).toHaveValue('');
    });
  });

  describe('allowCopy 复制功能', () => {
    it('allowCopy 且有内容时显示复制按钮', () => {
      render(<TextInputArea value="可复制的内容" onChange={() => {}} allowCopy />);
      expect(screen.getByText('复制')).toBeInTheDocument();
    });

    it('allowCopy 但无内容时隐藏复制按钮', () => {
      render(<TextInputArea value="" onChange={() => {}} allowCopy />);
      expect(screen.queryByText('复制')).not.toBeInTheDocument();
    });

    it('allowCopy=false 时不显示复制按钮', () => {
      render(<TextInputArea value="内容" onChange={() => {}} />);
      expect(screen.queryByText('复制')).not.toBeInTheDocument();
    });

    it('复制时调用 showMessage', async () => {
      const showMessage = vi.fn();
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      });

      render(
        <TextInputArea value="测试" onChange={() => {}} allowCopy showMessage={showMessage} />,
      );

      fireEvent.click(screen.getByText('复制'));

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('测试');
      await vi.waitFor(() => {
        expect(showMessage).toHaveBeenCalledWith('复制成功', { severity: 'success' });
      });
    });

    it('复制失败时调用 showMessage 错误提示', async () => {
      const showMessage = vi.fn();
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockRejectedValue(new Error('失败')) },
      });

      render(
        <TextInputArea value="测试" onChange={() => {}} allowCopy showMessage={showMessage} />,
      );

      fireEvent.click(screen.getByText('复制'));

      await vi.waitFor(() => {
        expect(showMessage).toHaveBeenCalledWith('复制失败', { severity: 'error' });
      });
    });
  });

  describe('showCount 字符计数', () => {
    it('显示当前字符数', () => {
      render(<TextInputArea value="hello" onChange={() => {}} showCount />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('空内容时显示 0', () => {
      render(<TextInputArea value="" onChange={() => {}} showCount />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('设置 maxLength 时显示计数上限', () => {
      render(<TextInputArea value="ab" onChange={() => {}} showCount maxLength={10} />);
      expect(screen.getByText('2 / 10')).toBeInTheDocument();
    });
  });

  describe('maxLength', () => {
    it('超出 maxLength 的输入应被截断', () => {
      const handleChange = vi.fn();
      render(<TextInputArea value="" onChange={handleChange} maxLength={5} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '123456' } });

      expect(handleChange).not.toHaveBeenCalledWith('123456');
    });

    it('未超出 maxLength 的输入应正常触发', () => {
      const handleChange = vi.fn();
      render(<TextInputArea value="" onChange={handleChange} maxLength={5} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '123' } });

      expect(handleChange).toHaveBeenCalledWith('123');
    });
  });

  describe('验证规则', () => {
    it('onChange 触发时验证失败应设置 error', () => {
      render(
        <TextInputArea
          value=""
          onChange={() => {}}
          validateTrigger="onChange"
          rules={[{ validator: (v) => v.length >= 3, message: '至少3个字符' }]}
        />,
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'ab' } });

      expect(screen.getByText('至少3个字符')).toBeInTheDocument();
    });

    it('onBlur 触发时验证失败应设置 error', () => {
      render(
        <TextInputArea
          value="ab"
          onChange={() => {}}
          validateTrigger="onBlur"
          rules={[{ validator: (v) => v.length >= 3, message: '至少3个字符' }]}
        />,
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.blur(textarea);

      expect(screen.getByText('至少3个字符')).toBeInTheDocument();
    });

    it('验证通过不应显示错误', () => {
      render(
        <TextInputArea
          value="abc"
          onChange={() => {}}
          validateTrigger="onChange"
          rules={[{ validator: (v) => v.length >= 3, message: '至少3个字符' }]}
        />,
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'abcd' } });

      expect(screen.queryByText('至少3个字符')).not.toBeInTheDocument();
    });

    it('onAction 触发时验证失败应阻止 action 执行', () => {
      const handleAction = vi.fn();
      render(
        <TextInputArea
          value="ab"
          onChange={() => {}}
          validateTrigger="onAction"
          rules={[{ validator: (v) => v.length >= 3, message: '至少3个字符' }]}
          actions={[
            {
              key: 'test',
              label: '执行',
              onClick: handleAction,
            },
          ]}
        />,
      );

      fireEvent.click(screen.getByText('执行'));

      expect(handleAction).not.toHaveBeenCalled();
      expect(screen.getByText('至少3个字符')).toBeInTheDocument();
    });
  });

  describe('操作栏 actions', () => {
    it('应渲染顶部操作按钮', () => {
      render(
        <TextInputArea
          value="内容"
          onChange={() => {}}
          actions={[{ key: 'top-action', label: '顶部操作', onClick: vi.fn() }]}
        />,
      );

      expect(screen.getByText('顶部操作')).toBeInTheDocument();
    });

    it('应渲染底部操作按钮', () => {
      render(
        <TextInputArea
          value="内容"
          onChange={() => {}}
          actions={[
            { key: 'bottom-action', label: '底部操作', position: 'bottom', onClick: vi.fn() },
          ]}
        />,
      );

      expect(screen.getByText('底部操作')).toBeInTheDocument();
    });

    it('点击操作按钮触发 onClick', () => {
      const handleClick = vi.fn();
      render(
        <TextInputArea
          value="内容"
          onChange={() => {}}
          actions={[{ key: 'act', label: '操作', onClick: handleClick }]}
        />,
      );

      fireEvent.click(screen.getByText('操作'));

      expect(handleClick).toHaveBeenCalledWith(
        '内容',
        expect.objectContaining({
          clear: expect.any(Function),
          setError: expect.any(Function),
        }),
      );
    });

    it('disabled 为 true 时按钮应禁用', () => {
      render(
        <TextInputArea
          value=""
          onChange={() => {}}
          actions={[{ key: 'act', label: '操作', onClick: vi.fn(), disabled: true }]}
        />,
      );

      expect(screen.getByText('操作')).toBeDisabled();
    });

    it('disabled 为函数且返回 true 时按钮应禁用', () => {
      render(
        <TextInputArea
          value=""
          onChange={() => {}}
          actions={[{ key: 'act', label: '操作', onClick: vi.fn(), disabled: (v) => !v }]}
        />,
      );

      expect(screen.getByText('操作')).toBeDisabled();
    });

    it('primary 类型按钮应使用 contained 样式', () => {
      render(
        <TextInputArea
          value="内容"
          onChange={() => {}}
          actions={[
            { key: 'p', label: '主要', type: 'primary', position: 'bottom', onClick: vi.fn() },
          ]}
        />,
      );

      const btn = screen.getByText('主要');
      expect(btn).toHaveClass('MuiButton-contained');
    });
  });

  describe('title', () => {
    it('应渲染 title', () => {
      render(<TextInputArea title="输入区域" value="" onChange={() => {}} />);
      expect(screen.getByText('输入区域')).toBeInTheDocument();
    });

    it('不设置 title 时不渲染标题', () => {
      const { container } = render(<TextInputArea value="" onChange={() => {}} />);
      expect(container.querySelector('.MuiTypography-body2')).not.toBeInTheDocument();
    });
  });

  describe('disabled 和 readOnly', () => {
    it('disabled 时输入框应禁用', () => {
      render(<TextInputArea value="内容" onChange={() => {}} disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('readOnly 时输入框应只读', () => {
      render(<TextInputArea value="内容" onChange={() => {}} readOnly />);
      // MUI TextField 的 readOnly 通过 inputProps 设置，textarea 不会被禁用
      expect(screen.getByRole('textbox')).not.toBeDisabled();
    });
  });

  describe('autoFocus', () => {
    it('autoFocus 应自动聚焦', () => {
      render(<TextInputArea autoFocus value="" onChange={() => {}} />);
      expect(document.activeElement).toBe(screen.getByRole('textbox'));
    });
  });

  describe('showMessage prop', () => {
    it('复制成功时调用 showMessage', async () => {
      const showMessage = vi.fn();
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      });

      render(
        <TextInputArea value="测试" onChange={() => {}} allowCopy showMessage={showMessage} />,
      );
      fireEvent.click(screen.getByText('复制'));

      await vi.waitFor(() => {
        expect(showMessage).toHaveBeenCalledWith('复制成功', { severity: 'success' });
      });
    });
  });

  describe('externalError 外部错误', () => {
    it('设置 externalError 时应显示错误状态', () => {
      render(<TextInputArea value="内容" onChange={() => {}} externalError="JSON 格式无效" />);

      expect(screen.getByText('JSON 格式无效')).toBeInTheDocument();
    });

    it('externalError 为空时应隐藏错误状态', () => {
      const { rerender } = render(
        <TextInputArea value="内容" onChange={() => {}} externalError="错误" />,
      );

      expect(screen.getByText('错误')).toBeInTheDocument();

      rerender(<TextInputArea value="内容" onChange={() => {}} externalError="" />);

      expect(screen.queryByText('错误')).not.toBeInTheDocument();
    });

    it('externalError 优先级高于内部验证错误', () => {
      render(
        <TextInputArea
          value="ab"
          onChange={() => {}}
          externalError="外部错误"
          validateTrigger="onChange"
          rules={[{ validator: (v) => v.length >= 3, message: '内部验证错误' }]}
        />,
      );

      expect(screen.getByText('外部错误')).toBeInTheDocument();
      expect(screen.queryByText('内部验证错误')).not.toBeInTheDocument();
    });

    it('externalError 清除后应显示内部验证错误', () => {
      const { rerender } = render(
        <TextInputArea
          value="ab"
          onChange={() => {}}
          externalError="外部错误"
          validateTrigger="onChange"
          rules={[{ validator: (v) => v.length >= 3, message: '至少3个字符' }]}
        />,
      );

      expect(screen.getByText('外部错误')).toBeInTheDocument();

      rerender(
        <TextInputArea
          value="ab"
          onChange={() => {}}
          validateTrigger="onChange"
          rules={[{ validator: (v) => v.length >= 3, message: '至少3个字符' }]}
        />,
      );

      expect(screen.queryByText('外部错误')).not.toBeInTheDocument();

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'a' } });

      expect(screen.getByText('至少3个字符')).toBeInTheDocument();
    });
  });

  describe('autoResize', () => {
    it('autoResize=true 时设置 minRows/maxRows', () => {
      const { container } = render(
        <TextInputArea value="" onChange={() => {}} autoResize minRows={3} maxRows={8} />,
      );

      const textarea = container.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    it('autoResize=false 时设置固定 rows', () => {
      const { container } = render(
        <TextInputArea value="" onChange={() => {}} autoResize={false} minRows={5} />,
      );

      const textarea = container.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('样式集成', () => {
    it('应透传 className', () => {
      const { container } = render(
        <TextInputArea value="" onChange={() => {}} className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('应透传 style', () => {
      const { container } = render(
        <TextInputArea value="" onChange={() => {}} style={{ marginTop: 10 }} />,
      );

      expect(container.firstChild).toHaveStyle({ marginTop: '10px' });
    });

    it('应透传 sx 样式', () => {
      const { container } = render(<TextInputArea value="" onChange={() => {}} sx={{ mb: 3 }} />);

      expect(container.firstChild).toHaveStyle({ marginBottom: '24px' });
    });
  });
});
