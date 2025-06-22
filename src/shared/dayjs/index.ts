import dayjs from 'dayjs';
import ko from 'dayjs/locale/ko';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration).locale(ko);

export default dayjs;
