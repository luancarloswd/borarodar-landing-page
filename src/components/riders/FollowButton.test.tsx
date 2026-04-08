import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FollowButton from "./FollowButton";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      follow: "Follow",
      following: "Following",
      loading: "...",
      error_self: "You cannot follow yourself.",
      error_not_found: "Rider not found.",
      error_generic: "Something went wrong. Please try again.",
    };
    return messages[key] ?? key;
  },
}));

// Mock fetch
const mockFetch = vi.fn() as Mock;
global.fetch = mockFetch;

const defaultProps = {
  targetUserId: "target-123",
  accessToken: "jwt-token-abc",
};

describe("FollowButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders follow button in default state", () => {
    render(<FollowButton {...defaultProps} />);
    const button = screen.getByRole("button", { name: "Follow" });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent("Follow");
  });

  it("renders following state when initialFollowing is true", () => {
    render(<FollowButton {...defaultProps} initialFollowing />);
    const button = screen.getByRole("button", { name: "Following" });
    expect(button).toHaveTextContent("Following");
    expect(button).toBeDisabled();
  });

  it("sends POST request with correct headers on click", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 201 });
    const user = userEvent.setup();

    render(<FollowButton {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Follow" }));

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.borarodar.app/riders/target-123/follow",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer jwt-token-abc",
          "Content-Length": "0",
        },
      }
    );
  });

  it("transitions to following state on 201 success", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 201 });
    const onFollowChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FollowButton {...defaultProps} onFollowChange={onFollowChange} />
    );
    await user.click(screen.getByRole("button", { name: "Follow" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Following" })).toHaveTextContent("Following");
    });
    expect(onFollowChange).toHaveBeenCalledWith(true);
  });

  it("handles 409 conflict by toggling to following without error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 409 });
    const onFollowChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FollowButton {...defaultProps} onFollowChange={onFollowChange} />
    );
    await user.click(screen.getByRole("button", { name: "Follow" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Following" })).toHaveTextContent("Following");
    });
    expect(onFollowChange).toHaveBeenCalledWith(true);
    // No error message should appear
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("displays error message on 400 (self-follow)", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });
    const user = userEvent.setup();

    render(<FollowButton {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Follow" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "You cannot follow yourself."
      );
    });
    // Button should still show "Follow" (not following)
    expect(screen.getByRole("button", { name: "Follow" })).toHaveTextContent("Follow");
  });

  it("displays error message on 404 (rider not found)", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const user = userEvent.setup();

    render(<FollowButton {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Follow" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Rider not found.");
    });
  });

  it("displays generic error on unexpected status code", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const user = userEvent.setup();

    render(<FollowButton {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Follow" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Something went wrong. Please try again."
      );
    });
  });

  it("displays generic error on network failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const user = userEvent.setup();

    render(<FollowButton {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Follow" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Something went wrong. Please try again."
      );
    });
  });

  it("prevents duplicate clicks while loading", async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockFetch.mockReturnValueOnce(pendingPromise);
    const user = userEvent.setup();

    render(<FollowButton {...defaultProps} />);
    const button = screen.getByRole("button", { name: "Follow" });
    await user.click(button);

    // Button shows loading and is disabled
    expect(screen.getByRole("button")).toHaveTextContent("...");
    expect(screen.getByRole("button")).toBeDisabled();

    // Second click should not trigger another fetch
    await user.click(screen.getByRole("button"));
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Resolve and wait for state update to clean up
    await act(async () => {
      resolvePromise!({ ok: true, status: 201 });
    });
  });

  it("does not call fetch when already following", async () => {
    const user = userEvent.setup();
    render(<FollowButton {...defaultProps} initialFollowing />);

    await user.click(screen.getByRole("button", { name: "Following" }));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("clears error message on subsequent click", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, status: 201 });
    const user = userEvent.setup();

    render(<FollowButton {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Follow" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    // Click again - error should clear and succeed
    await user.click(screen.getByRole("button", { name: "Follow" }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Following" })).toHaveTextContent("Following");
    });
  });
});
