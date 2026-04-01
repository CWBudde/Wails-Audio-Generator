/**
 * ControlModeToggle Component Tests
 *
 * Tests the ControlModeToggle UI component including accessibility,
 * user interactions, and proper state management integration.
 */

import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlModeToggle } from '../ControlModeToggle';
import { ControlMode } from '../../types/controlModes';

describe('ControlModeToggle Component', () => {
  const defaultProps = {
    currentMode: ControlMode.FIXED_FREQUENCY,
    onModeChange: vi.fn(),
    disabled: false,
    oscillatorLabel: 'Test Oscillator',
    compact: true,
  };

  it('should render with fixed frequency mode', () => {
    render(<ControlModeToggle {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('🎵 Fixed');
  });

  it('should render with sweep mode', () => {
    render(<ControlModeToggle {...defaultProps} currentMode={ControlMode.SWEEP} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('🔀 Sweep');
  });

  it('should call onModeChange when button is clicked', () => {
    const mockOnModeChange = vi.fn();
    render(<ControlModeToggle {...defaultProps} onModeChange={mockOnModeChange} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnModeChange).toHaveBeenCalledWith(ControlMode.SWEEP);
  });

  it('should switch back to fixed frequency when clicked again', () => {
    const mockOnModeChange = vi.fn();
    render(
      <ControlModeToggle
        {...defaultProps}
        currentMode={ControlMode.SWEEP}
        onModeChange={mockOnModeChange}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnModeChange).toHaveBeenCalledWith(ControlMode.FIXED_FREQUENCY);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<ControlModeToggle {...defaultProps} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not call onModeChange when disabled', () => {
    const mockOnModeChange = vi.fn();
    render(<ControlModeToggle {...defaultProps} disabled={true} onModeChange={mockOnModeChange} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    render(<ControlModeToggle {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button.getAttribute('aria-label')).toContain('Test Oscillator');
    expect(button.getAttribute('aria-label')).toContain('control mode');
  });

  it('should show correct visual indicators for fixed frequency mode', () => {
    render(<ControlModeToggle {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-50', 'text-blue-700', 'border-blue-300');
  });

  it('should show correct visual indicators for sweep mode', () => {
    render(<ControlModeToggle {...defaultProps} currentMode={ControlMode.SWEEP} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-green-50', 'text-green-700', 'border-green-300');
  });

  it('should show tooltip on hover', async () => {
    render(<ControlModeToggle {...defaultProps} />);

    const button = screen.getByRole('button');

    // Hover to show tooltip
    fireEvent.mouseEnter(button);

    // Should show tooltip content
    expect(screen.getByText('Control Modes')).toBeInTheDocument();
    expect(screen.getByText(/Manual frequency control via slider/)).toBeInTheDocument();
    expect(screen.getByText(/Automated frequency sweeps over time/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<ControlModeToggle {...defaultProps} className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should be focusable and have proper accessibility attributes', () => {
    render(<ControlModeToggle {...defaultProps} />);

    const button = screen.getByRole('button');

    // Verify the button is focusable
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('title');
  });

  it('should not respond when disabled', () => {
    const mockOnModeChange = vi.fn();
    render(<ControlModeToggle {...defaultProps} disabled={true} onModeChange={mockOnModeChange} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnModeChange).not.toHaveBeenCalled();
  });

  it('should have proper focus styles', () => {
    render(<ControlModeToggle {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary-500');
  });

  it('should show appropriate icons for each mode', () => {
    const { rerender } = render(<ControlModeToggle {...defaultProps} />);

    // Check for musical note icon (Fixed Frequency)
    expect(screen.getByText('🎵 Fixed')).toBeInTheDocument();

    // Switch to sweep mode
    rerender(<ControlModeToggle {...defaultProps} currentMode={ControlMode.SWEEP} />);

    // Check for shuffle/sweep icon (Sweep)
    expect(screen.getByText('🔀 Sweep')).toBeInTheDocument();
  });
});

describe('ControlModeToggle Integration', () => {
  it('should work correctly with state management', () => {
    let currentMode = ControlMode.FIXED_FREQUENCY;
    const handleModeChange = (mode: ControlMode) => {
      currentMode = mode;
    };

    const { rerender } = render(
      <ControlModeToggle
        currentMode={currentMode}
        onModeChange={handleModeChange}
        disabled={false}
        oscillatorLabel="Test"
        compact={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('🎵 Fixed');

    fireEvent.click(button);
    expect(currentMode).toBe(ControlMode.SWEEP);

    // Re-render with new mode
    rerender(
      <ControlModeToggle
        currentMode={currentMode}
        onModeChange={handleModeChange}
        disabled={false}
        oscillatorLabel="Test"
        compact={true}
      />
    );

    expect(screen.getByRole('button')).toHaveTextContent('🔀 Sweep');
  });

  it('should handle rapid mode changes gracefully', () => {
    const mockOnModeChange = vi.fn();
    render(
      <ControlModeToggle
        currentMode={ControlMode.FIXED_FREQUENCY}
        onModeChange={mockOnModeChange}
        disabled={false}
        oscillatorLabel="Test"
        compact={true}
      />
    );

    const button = screen.getByRole('button');

    // Simulate rapid clicks - each click should switch to SWEEP mode
    // since the component always calls with the opposite of currentMode
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    // All calls should be to switch to SWEEP mode since currentMode never changes
    // (the parent component would need to update currentMode to see alternating behavior)
    expect(mockOnModeChange).toHaveBeenCalledTimes(3);
    expect(mockOnModeChange).toHaveBeenNthCalledWith(1, ControlMode.SWEEP);
    expect(mockOnModeChange).toHaveBeenNthCalledWith(2, ControlMode.SWEEP);
    expect(mockOnModeChange).toHaveBeenNthCalledWith(3, ControlMode.SWEEP);
  });
});
