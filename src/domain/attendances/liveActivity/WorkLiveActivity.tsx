import { type LiveActivityEnvironment, type LiveActivityLayout, createLiveActivity } from 'expo-widgets';

import { HStack, ProgressView, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, monospacedDigit, padding, tint } from '@expo/ui/swift-ui/modifiers';

import type { WorkActivityProps } from './types';

// ────────────────────────────────────────────────────────────────────────────
// WorkLiveActivity — iOS Live Activity for the current work session.
//
// This is an expo-widgets `'widget'` component: it MUST be pure + synchronous,
// may only use `@expo/ui/swift-ui` components/modifiers, and may NOT reference
// React hooks/state/context or any app-level module value. Every constant and
// helper is therefore declared INSIDE the function; all data arrives via
// `props` and `environment`.
//
// Design: a LINEAR progress bar shows progress toward the target; the remaining
// time is the hero in brand green; worked time + target clock time are secondary
// (white on the dark lock screen). In overtime the accent flips to danger red
// and the bar is full (remaining floors at 0:00).
//
// All labels are APP-COMPUTED static strings (minute granularity) rather than a
// live-ticking `timerInterval` — they refresh when the app pushes an update
// (see the foreground minute refresh in the home screen). This intentionally
// trades second-level ticking for a calmer, minute-accurate display.
// ────────────────────────────────────────────────────────────────────────────
function WorkActivity(props: WorkActivityProps, environment: LiveActivityEnvironment): LiveActivityLayout {
  'widget';

  // --- palette (brand + danger are identical in both color schemes) ---
  const BRAND = '#1ed760';
  const DANGER = '#f3727f';
  const isDark = environment.colorScheme === 'dark';
  // High-contrast text for the (usually dark) lock screen: captions AND values
  // are full white on dark so "퇴근시간"/"근무"/"목표" and the target clock time
  // stay clearly legible on the black background.
  const valueColor = isDark ? '#ffffff' : '#11181C';
  const captionColor = isDark ? '#ffffff' : '#3c3c43';
  const accentColor = props.isOvertime ? DANGER : BRAND;
  const clampedProgress = props.progress < 0 ? 0 : props.progress > 1 ? 1 : props.progress;
  const heroLabel = props.isOvertime ? '초과 근무' : '퇴근까지';

  // --- shared building blocks (reused across regions) ---
  const remainingHero = (
    <Text
      modifiers={[
        font({ size: 40, weight: 'bold', design: 'rounded' }),
        monospacedDigit(),
        foregroundStyle(accentColor),
      ]}
    >
      {props.remainingLabel}
    </Text>
  );

  const remainingCompact = (
    <Text
      modifiers={[
        font({ size: 15, weight: 'semibold', design: 'rounded' }),
        monospacedDigit(),
        foregroundStyle(accentColor),
      ]}
    >
      {props.remainingCompact}
    </Text>
  );

  const workedCompact = (
    <Text modifiers={[font({ size: 15, weight: 'medium' }), monospacedDigit(), foregroundStyle(valueColor)]}>
      {props.workedCompact}
    </Text>
  );

  const captionText = (label: string) => (
    <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(captionColor)]}>{label}</Text>
  );

  const valueText = (value: string) => (
    <Text modifiers={[font({ size: 15, weight: 'semibold' }), monospacedDigit(), foregroundStyle(valueColor)]}>
      {value}
    </Text>
  );

  // Target clock time: same white color as the captions, ~half the hero size.
  const targetValue = (
    <Text modifiers={[font({ size: 20, weight: 'semibold' }), monospacedDigit(), foregroundStyle(valueColor)]}>
      {props.targetLabel}
    </Text>
  );

  // Linear determinate progress bar (fills the available width of its container).
  const progressBar = <ProgressView value={clampedProgress} modifiers={[tint(accentColor)]} />;

  return {
    // ── Lock screen / Notification Center banner (linear progress bar + hero) ──
    banner: (
      <VStack alignment="leading" spacing={6} modifiers={[padding({ horizontal: 16, vertical: 12 })]}>
        {captionText(heroLabel)}
        {remainingHero}
        {progressBar}
        <HStack alignment="firstTextBaseline" spacing={6}>
          {captionText('근무')}
          {valueText(props.workedLabel)}
          <Spacer />
          {captionText('목표')}
          {targetValue}
        </HStack>
      </VStack>
    ),

    // ── Dynamic Island: compact (short compact strings avoid ".." truncation) ──
    compactLeading: remainingCompact,
    compactTrailing: workedCompact,

    // ── Dynamic Island: minimal ──
    minimal: remainingCompact,

    // ── Dynamic Island: expanded ──
    expandedLeading: (
      <VStack alignment="leading" spacing={2} modifiers={[padding({ leading: 8 })]}>
        {captionText(heroLabel)}
        {remainingHero}
      </VStack>
    ),
    expandedTrailing: (
      <VStack alignment="trailing" spacing={2} modifiers={[padding({ trailing: 8 })]}>
        {captionText('근무')}
        {valueText(props.workedLabel)}
      </VStack>
    ),
    expandedBottom: (
      <VStack alignment="leading" spacing={6} modifiers={[padding({ horizontal: 8 })]}>
        {progressBar}
        <HStack alignment="firstTextBaseline" spacing={6}>
          {captionText('목표')}
          {targetValue}
          <Spacer />
        </HStack>
      </VStack>
    ),
  };
}

export default createLiveActivity<WorkActivityProps>('WorkLiveActivity', WorkActivity);
