"use client";
import { OnboardingTemplate } from "@/components/OnboardingTemplate";

export default function Onboarding2() {
  return (
    <OnboardingTemplate
      index={1}
      nextPath="/subscribe"
      nextLabel="Get Started"
    />
  );
}
