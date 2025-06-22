import dayjs from 'dayjs';
import ko from 'dayjs/locale/ko';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale(ko);
dayjs.extend(duration);
dayjs.extend(relativeTime);

export default dayjs;
