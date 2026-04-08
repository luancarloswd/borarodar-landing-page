"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { APP_CONFIG } from "@/lib/config";
import Button from "@/components/ui/Button";

export interface FollowButtonProps {
  /** The user ID of the rider to follow */
  targetUserId: string;
  /** JWT access token for authentication */
  accessToken: string;
  /** Whether the current user is already following this rider */
  initialFollowing?: boolean;
  /** Optional callback after follow state changes */
  onFollowChange?: (isFollowing: boolean) => void;
}

export type FollowStatus = "idle" | "loading" | "error";

export default function FollowButton({
  targetUserId,
  accessToken,
  initialFollowing = false,
  onFollowChange,
}: FollowButtonProps) {
  const t = useTranslations("follow");
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [status, setStatus] = useState<FollowStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFollow = useCallback(async () => {
    if (isFollowing || status === "loading") return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch(
        `${APP_CONFIG.apiUrl}/riders/${targetUserId}/follow`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Length": "0",
          },
        }
      );

      if (response.ok) {
        setIsFollowing(true);
        onFollowChange?.(true);
        setStatus("idle");
        return;
      }

      if (response.status === 409) {
        // Already following - toggle state without error
        setIsFollowing(true);
        onFollowChange?.(true);
        setStatus("idle");
        return;
      }

      if (response.status === 400) {
        setErrorMessage(t("error_self"));
        setStatus("error");
        return;
      }

      if (response.status === 404) {
        setErrorMessage(t("error_not_found"));
        setStatus("error");
        return;
      }

      setErrorMessage(t("error_generic"));
      setStatus("error");
    } catch {
      setErrorMessage(t("error_generic"));
      setStatus("error");
    }
  }, [targetUserId, accessToken, isFollowing, status, onFollowChange, t]);

  return (
    <div>
      <Button
        variant={isFollowing ? "outline" : "primary"}
        size="sm"
        onClick={handleFollow}
        disabled={isFollowing || status === "loading"}
        aria-label={isFollowing ? t("following") : t("follow")}
      >
        {status === "loading"
          ? t("loading")
          : isFollowing
            ? t("following")
            : t("follow")}
      </Button>
      {errorMessage && (
        <p className="text-red-500 text-xs mt-1" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
