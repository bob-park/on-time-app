import dayjs from 'dayjs';

export function isSameMarginOfError(source: number, target: number, margin: number) {
  let pow = 0;
  let marginInt = margin;

  while (marginInt < 1) {
    marginInt *= 10;
    pow++;
  }

  marginInt = Math.round(marginInt);

  const sourceInt = Math.round(source * Math.pow(10, pow));
  const targetInt = Math.round(target * Math.pow(10, pow));

  return targetInt >= sourceInt - marginInt && targetInt <= sourceInt + marginInt;
}

export function isIncludeTime({ from, to }: { from: Date; to: Date }, target: Date) {
  return dayjs(from).isBefore(target) && dayjs(to).isAfter(target);
}
