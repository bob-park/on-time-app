import { padStart } from 'lodash';

export class TimeCode {
  private readonly _hours: number;
  private readonly _minutes: number;
  private readonly _seconds: number;
  private readonly _milliseconds: number;

  public constructor(seconds: number) {
    this._milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1_000);
    this._seconds = Math.floor(seconds % 60);
    this._minutes = Math.floor((seconds / 60) % 60);
    this._hours = Math.floor(seconds / 3_600);
  }

  public get hours() {
    return this._hours;
  }

  public get formatHours() {
    return `${padStart(this._hours + '', 2, '0')}`;
  }

  public get minutes() {
    return this._minutes;
  }

  public get formatMinutes() {
    return `${padStart(this._minutes + '', 2, '0')}`;
  }

  public get seconds() {
    return this._seconds;
  }

  public get milliseconds() {
    return this._milliseconds;
  }

  public toSeconds() {
    return this._hours * 3_600 + this._minutes * 60 + this.seconds + this._milliseconds / 1_000;
  }

  public toString() {
    return `${padStart(this.hours + '', 2, '0')}:${padStart(this._minutes + '', 2, '0')}:${padStart(this._seconds + '', 2, '0')}`;
  }
}
