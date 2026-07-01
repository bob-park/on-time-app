import { type LiveActivityEnvironment, type LiveActivityLayout, createLiveActivity } from 'expo-widgets';

import { Gauge, HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, frame, gaugeStyle, monospacedDigit, padding, tint } from '@expo/ui/swift-ui/modifiers';

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
// Design (direction A / L2 = circular progress): a circular capacity Gauge
// (SwiftUI `.accessoryCircularCapacity`) shows progress toward the target;
// beside it the remaining time is the hero in brand green; worked time + target
// clock time are secondary. In overtime the accent flips to danger red and the
// ring is full (remaining floors at 0:00).
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
  // High-contrast text for the (usually dark) lock screen. Values use full
  // white on dark; captions use a light gray — NOT a dim low-opacity gray — so
  // the target/worked labels stay legible on the black background.
  const valueColor = isDark ? '#ffffff' : '#11181C';
  const captionColor = isDark ? '#c7c7cc' : '#3c3c43';
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

  // Circular capacity gauge = a filled progress ring (SwiftUI
  // `.accessoryCircularCapacity`). `size` scales the ring for the given region.
  const progressRing = (size: number) => (
    <Gauge
      value={clampedProgress}
      modifiers={[gaugeStyle('circularCapacity'), tint(accentColor), frame({ width: size, height: size })]}
    />
  );

  return {
    // ── Lock screen / Notification Center banner (circular progress + hero) ──
    banner: (
      <HStack alignment="center" spacing={16} modifiers={[padding({ horizontal: 16, vertical: 12 })]}>
        {progressRing(64)}
        <VStack alignment="leading" spacing={2}>
          {captionText(heroLabel)}
          {remainingHero}
          <HStack alignment="firstTextBaseline" spacing={6}>
            {captionText('근무')}
            {valueText(props.workedLabel)}
            <Spacer />
            {captionText('목표')}
            {valueText(props.targetLabel)}
          </HStack>
        </VStack>
      </HStack>
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
      <HStack alignment="center" spacing={12} modifiers={[padding({ horizontal: 8 })]}>
        {progressRing(44)}
        <HStack alignment="firstTextBaseline" spacing={6}>
          {captionText('목표')}
          {valueText(props.targetLabel)}
        </HStack>
        <Spacer />
      </HStack>
    ),
  };
}

export default createLiveActivity<WorkActivityProps>('WorkLiveActivity', WorkActivity);
