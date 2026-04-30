"use client";
import { OnboardingTemplate } from "@/components/OnboardingTemplate";

export default function Onboarding1() {
  return (
    <OnboardingTemplate
      index={0}
      nextPath="/onboarding/tab2"
      nextLabel="Continue"
    />
  );
}
