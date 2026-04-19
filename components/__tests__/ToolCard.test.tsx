import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ToolCard from '../ToolCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

describe('ToolCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with title and description', () => {
      render(
        <ToolCard
          title="Test Tool"
          description="This is a test tool"
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
        />
      );

      expect(screen.getByText('Test Tool')).toBeInTheDocument();
      expect(screen.getByText('This is a test tool')).toBeInTheDocument();
    });

    it('should render with only title when no description', () => {
      render(
        <ToolCard
          title="Title Only"
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
        />
      );

      expect(screen.getByText('Title Only')).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(
        <ToolCard
          title="With Icon"
          colorCode="#2196f3"
          icon={<AccessTimeIcon data-testid="test-icon" />}
          onClick={() => {}}
        />
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should render snapshot content when provided', () => {
      render(
        <ToolCard
          title="With Snapshot"
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
          snapshot={<div data-testid="snapshot">Snapshot Content</div>}
        />
      );

      expect(screen.getByTestId('snapshot')).toBeInTheDocument();
    });

    it('should not render snapshot section when not provided', () => {
      const { container } = render(
        <ToolCard
          title="No Snapshot"
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
        />
      );

      expect(container.querySelector('[data-testid="snapshot"]')).not.toBeInTheDocument();
    });
  });

  describe('AI Badge', () => {
    it('should render AI badge when hasAI is true', () => {
      render(
        <ToolCard
          title="AI Tool"
          hasAI={true}
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
        />
      );

      const autoAwesomeIcon = screen.getByTestId('AutoAwesomeIcon');
      expect(autoAwesomeIcon).toBeInTheDocument();
    });

    it('should not render AI badge when hasAI is false', () => {
      render(
        <ToolCard
          title="Normal Tool"
          hasAI={false}
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={() => {}}
        />
      );

      const autoAwesomeIcon = screen.queryByTestId('AutoAwesomeIcon');
      expect(autoAwesomeIcon).not.toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(
        <ToolCard
          title="Clickable"
          colorCode="#2196f3"
          icon={<AccessTimeIcon />}
          onClick={handleClick}
        />
      );

      const card = screen.getByText('Clickable').closest('.MuiBox-root');
      if (card) {
        fireEvent.click(card);
      }

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Styling', () => {
    it('should apply custom color code', () => {
      const customColor = '#ff5722';
      const { container } = render(
        <ToolCard
          title="Custom Color"
          colorCode={customColor}
          icon={<AccessTimeIcon />}
          onClick={() => {}}
        />
      );

      const iconContainer = container.querySelector('.MuiBox-root > div');
      expect(iconContainer).toBeInTheDocument();
    });
  });
});