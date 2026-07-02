import { type LiveActivityLayout, createLiveActivity } from 'expo-widgets';

import { HStack, ProgressView, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  environment,
  font,
  foregroundStyle,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  padding,
  tint,
} from '@expo/ui/swift-ui/modifiers';

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
// Design: the flowing time texts (remaining until target / worked since
// clock-in) are SYSTEM-RENDERED via `Text date + dateStyle('relative')`, and
// the linear progress bar advances on its own via `ProgressView timerInterval`
// — so both keep updating even when the app is terminated. The wall-clock
// times are also system-rendered (`dateStyle('time')` + en_GB locale for
// 24-hour HH:mm). The app only pushes static bits: compact Dynamic Island
// strings and the overtime flip (caption "남은 시간" → "초과 근무", accent
// green → red). If the
// app is dead when the target passes, the relative text naturally counts back
// up past zero (the value doubles as the overtime count-up) but the caption
// and color stay stale until the next app push — an accepted limitation.
// ────────────────────────────────────────────────────────────────────────────
function WorkActivity(props: WorkActivityProps): LiveActivityLayout {
  'widget';

  // --- palette (brand + danger are identical in both color schemes) ---
  const BRAND = '#1ed760';
  const DANGER = '#f3727f';
  // The Live Activity surface (lock screen / Dynamic Island) is always dark, so
  // every label/value except the accent-colored remaining hero is full white —
  // unconditionally, regardless of the device's light/dark scheme.
  const valueColor = '#ffffff';
  const captionColor = '#ffffff';
  const accentColor = props.isOvertime ? DANGER : BRAND;
  const heroLabel = props.isOvertime ? '초과 근무' : '남은 시간';

  const clockInDate = new Date(props.clockInAtMs);
  const targetDate = new Date(props.targetLeaveAtMs);

  // --- shared building blocks (reused across regions) ---
  // System-rendered relative time ("8시간 5분" on Korean devices), updating
  // without app pushes. `lineLimit(1)` + `minimumScaleFactor` shrink the text
  // to fit the narrow Dynamic Island expanded regions instead of truncating.
  // Remaining counts toward the target; past the target the same text counts
  // back up, which doubles as the overtime amount under the "초과 근무" caption.
  const remainingHero = (
    <Text
      date={targetDate}
      dateStyle="relative"
      markdownEnabled
      modifiers={[
        font({ size: 24, weight: 'bold', design: 'rounded' }),
        monospacedDigit(),
        lineLimit(1),
        minimumScaleFactor(0.5),
        foregroundStyle(accentColor),
      ]}
    />
  );

  const workedHero = (
    <Text
      date={clockInDate}
      dateStyle="relative"
      modifiers={[
        font({ size: 24, weight: 'bold', design: 'rounded' }),
        monospacedDigit(),
        lineLimit(1),
        minimumScaleFactor(0.5),
        foregroundStyle(valueColor),
      ]}
    />
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

  // System-rendered wall-clock time. `Text.DateStyle` has no custom format, so
  // the en_GB locale forces 24-hour "HH:mm" regardless of the device's 12/24h
  // setting — scoped to this Text only (a wider scope would flip the relative
  // hero texts to English).
  const timeText = (date: Date) => (
    <Text
      date={date}
      dateStyle="time"
      modifiers={[
        environment({ key: 'locale', value: 'en_GB' }),
        font({ size: 15, weight: 'semibold' }),
        monospacedDigit(),
        foregroundStyle(valueColor),
      ]}
    />
  );

  // Linear progress bar driven by the SYSTEM over the clock-in → target
  // interval (`countsDown={false}` fills as time passes; stays full past the
  // target). No app pushes needed.
  const progressBar = (
    <ProgressView
      timerInterval={{ lower: clockInDate, upper: targetDate }}
      countsDown={false}
      modifiers={[tint(accentColor)]}
    />
  );

  // Bottom row: clock-in / target wall-clock times ("09:00 출근 … 퇴근 18:00").
  const clockRow = (
    <HStack alignment="firstTextBaseline" spacing={4}>
      {timeText(clockInDate)}
      {captionText('출근')}
      <Spacer />
      {captionText('퇴근')}
      {timeText(targetDate)}
    </HStack>
  );

  return {
    // ── Lock screen / Notification Center banner ──
    // 남은 시간 | 근무 시간 (two live columns) → progress bar → 출근/퇴근 row.
    banner: (
      <VStack alignment="leading" spacing={6} modifiers={[padding({ horizontal: 16, vertical: 12 })]}>
        <HStack alignment="firstTextBaseline" spacing={6}>
          <VStack alignment="leading" spacing={2}>
            {captionText(heroLabel)}
            {remainingHero}
          </VStack>
          <Spacer />
          {/*<VStack alignment="trailing" spacing={2}>*/}
          {/*  {captionText('근무 시간')}*/}
          {/*  {workedHero}*/}
          {/*</VStack>*/}
        </HStack>
        {progressBar}
        {clockRow}
      </VStack>
    ),

    // ── Dynamic Island: compact (short compact strings avoid ".." truncation) ──
    compactLeading: remainingCompact,
    // compactTrailing: workedCompact,

    // ── Dynamic Island: minimal ──
    minimal: remainingCompact,

    // ── Dynamic Island: expanded ──
    expandedLeading: (
      <VStack alignment="leading" spacing={2} modifiers={[padding({ leading: 8 })]}>
        {captionText(heroLabel)}
        {remainingHero}
      </VStack>
    ),
    // expandedTrailing: (
    //   <VStack alignment="trailing" spacing={2} modifiers={[padding({ trailing: 8 })]}>
    //     {captionText('근무 시간')}
    //     {workedHero}
    //   </VStack>
    // ),
    expandedBottom: (
      <VStack alignment="leading" spacing={6} modifiers={[padding({ horizontal: 8 })]}>
        {progressBar}
        {clockRow}
      </VStack>
    ),
  };
}

export default createLiveActivity<WorkActivityProps>('WorkLiveActivity', WorkActivity);
