import { Text, TouchableOpacity } from 'react-native';

import cx from 'classnames';

interface SelectedButtonProps {
  selected?: boolean;
  label: string;
  onSelect?: () => void;
}

export default function SelectedButton({ selected = false, label, onSelect }: Readonly<SelectedButtonProps>) {
  // handle
  const handleSelect = () => {
    onSelect && onSelect();
  };

  return (
    <TouchableOpacity
      className={cx('h-10 w-24 items-center justify-center rounded-xl', {
        'bg-gray-200 dark:bg-gray-700': !selected,
        'bg-gray-700 dark:bg-gray-100': selected,
      })}
      disabled={selected}
      onPress={handleSelect}
    >
      <Text
        className={cx('font-semibold', {
          'text-gray-700 dark:text-gray-100': !selected,
          'text-gray-100 dark:text-gray-800': selected,
        })}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
