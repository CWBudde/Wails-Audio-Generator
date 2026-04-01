import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PlaybackControls } from '../PlaybackControls';

const mockAudioControls = {
  state: { isPlaying: false },
  handlePlay: vi.fn(),
  handleStop: vi.fn(),
};

describe('PlaybackControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows play button when not playing', () => {
    render(<PlaybackControls audioControls={mockAudioControls} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    expect(playButton).toBeInTheDocument();
    expect(playButton).toHaveTextContent('▶ Play');
  });

  it('shows stop button when playing', () => {
    const playingControls = {
      ...mockAudioControls,
      state: { isPlaying: true },
    };

    render(<PlaybackControls audioControls={playingControls} />);

    const stopButton = screen.getByRole('button', { name: /stop/i });
    expect(stopButton).toBeInTheDocument();
    expect(stopButton).toHaveTextContent('⏹ Stop');
  });

  it('calls handlePlay when play button is clicked', async () => {
    const user = userEvent.setup();
    render(<PlaybackControls audioControls={mockAudioControls} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    await user.click(playButton);

    expect(mockAudioControls.handlePlay).toHaveBeenCalledOnce();
  });

  it('calls handleStop when stop button is clicked', async () => {
    const user = userEvent.setup();
    const playingControls = {
      ...mockAudioControls,
      state: { isPlaying: true },
    };

    render(<PlaybackControls audioControls={playingControls} />);

    const stopButton = screen.getByRole('button', { name: /stop/i });
    await user.click(stopButton);

    expect(mockAudioControls.handleStop).toHaveBeenCalledOnce();
  });
});
