import { type LiveActivityEnvironment, type LiveActivityLayout, createLiveActivity } from 'expo-widgets';

import { HStack, Image, ProgressView, Spacer, Text, VStack } from '@expo/ui/swift-ui';
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
// Design (direction A): remaining time is the hero in brand green; worked time
// + target time are secondary/muted; a progress bar sits under the hero.
// In overtime the accent flips to a danger red and the remaining timer counts
// UP (elapsed overtime) instead of down.
// ────────────────────────────────────────────────────────────────────────────
function WorkActivity(props: WorkActivityProps, environment: LiveActivityEnvironment): LiveActivityLayout {
  'widget';

  // --- palette (brand + danger are identical in both color schemes) ---
  const BRAND = '#1ed760';
  const DANGER = '#f3727f';
  const isDark = environment.colorScheme === 'dark';
  const primaryColor = isDark ? '#ECEDEE' : '#11181C';
  const mutedColor = isDark ? '#9BA1A6' : '#687076';
  const accentColor = props.isOvertime ? DANGER : BRAND;

  // --- time ranges for the auto-updating SwiftUI Text timers ---
  const clockIn = new Date(props.clockInAt);
  const target = new Date(props.targetLeaveAt);
  const now = new Date();
  // Worked time counts up from clock-in; give the range a wide upper bound.
  const farFuture = new Date(clockIn.getTime() + 24 * 60 * 60 * 1000);
  const workedRange = { lower: clockIn, upper: farFuture };
  // Remaining: normally count down to target; in overtime count up from target.
  const remainingRange = props.isOvertime ? { lower: target, upper: farFuture } : { lower: now, upper: target };
  const clampedProgress = props.progress < 0 ? 0 : props.progress > 1 ? 1 : props.progress;
  const heroLabel = props.isOvertime ? '초과 근무' : '퇴근까지';

  // --- shared building blocks (reused across regions) ---
  const remainingHero = (
    <Text
      timerInterval={remainingRange}
      countsDown={!props.isOvertime}
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
      timerInterval={remainingRange}
      countsDown={!props.isOvertime}
      modifiers={[
        font({ size: 15, weight: 'semibold', design: 'rounded' }),
        monospacedDigit(),
        foregroundStyle(accentColor),
      ]}
    >
      {props.remainingLabel}
    </Text>
  );

  const workedSecondary = (
    <Text
      timerInterval={workedRange}
      countsDown={false}
      modifiers={[font({ size: 15, weight: 'semibold' }), monospacedDigit(), foregroundStyle(primaryColor)]}
    >
      {props.workedLabel}
    </Text>
  );

  const workedCompact = (
    <Text
      timerInterval={workedRange}
      countsDown={false}
      modifiers={[font({ size: 15, weight: 'medium' }), monospacedDigit(), foregroundStyle(mutedColor)]}
    >
      {props.workedLabel}
    </Text>
  );

  const targetTime = (
    <Text date={target} dateStyle="time" modifiers={[font({ size: 13 }), foregroundStyle(mutedColor)]} />
  );

  const progressBar = <ProgressView value={clampedProgress} modifiers={[tint(accentColor)]} />;

  return {
    // ── Lock screen / Notification Center banner (L2 layout) ──
    banner: (
      <VStack alignment="leading" spacing={6} modifiers={[padding({ horizontal: 16, vertical: 12 })]}>
        <HStack alignment="firstTextBaseline" spacing={6}>
          <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(mutedColor)]}>{heroLabel}</Text>
          <Spacer />
          <Text modifiers={[font({ size: 12 }), foregroundStyle(mutedColor)]}>목표</Text>
          {targetTime}
        </HStack>
        {remainingHero}
        {progressBar}
        <HStack alignment="firstTextBaseline" spacing={6}>
          <Text modifiers={[font({ size: 13 }), foregroundStyle(mutedColor)]}>근무</Text>
          {workedSecondary}
          <Spacer />
        </HStack>
      </VStack>
    ),

    // ── Dynamic Island: compact ──
    compactLeading: remainingCompact,
    compactTrailing: workedCompact,

    // ── Dynamic Island: minimal ──
    minimal: remainingCompact,

    // ── Dynamic Island: expanded ──
    expandedLeading: (
      <VStack alignment="leading" spacing={2} modifiers={[padding({ leading: 8 })]}>
        <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(mutedColor)]}>{heroLabel}</Text>
        {remainingHero}
      </VStack>
    ),
    expandedTrailing: (
      <VStack alignment="trailing" spacing={2} modifiers={[padding({ trailing: 8 })]}>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(mutedColor)]}>근무</Text>
        {workedSecondary}
      </VStack>
    ),
    expandedBottom: (
      <VStack alignment="leading" spacing={4} modifiers={[padding({ horizontal: 8 })]}>
        {progressBar}
        <HStack alignment="firstTextBaseline" spacing={6}>
          <Image systemName="flag.checkered" color={accentColor} size={12} />
          <Text modifiers={[font({ size: 12 }), foregroundStyle(mutedColor)]}>목표</Text>
          {targetTime}
          <Spacer />
        </HStack>
      </VStack>
    ),
  };
}

export default createLiveActivity<WorkActivityProps>('WorkLiveActivity', WorkActivity);
