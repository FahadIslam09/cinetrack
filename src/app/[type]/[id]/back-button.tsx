"use client";

import { BackButton } from "@/components/ui/back-button";

interface DetailsBackButtonProps {
  fallbackUrl?: string;
}

export function DetailsBackButton({ fallbackUrl = "/" }: DetailsBackButtonProps) {
  return <BackButton fallbackUrl={fallbackUrl} variant="pill" label="Back" />;
}
