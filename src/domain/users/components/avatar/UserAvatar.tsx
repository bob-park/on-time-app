import { useState } from 'react';

import { Image, Text, View } from 'react-native';

import cx from 'classnames';

interface UserAvatarProps {
  src?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  username?: string;
}

export default function UserAvatar({ src, size = 'base', username }: Readonly<UserAvatarProps>) {
  // state
  const [isError, setIsError] = useState<boolean>(false);

  return (
    <View
      className={cx('flex flex-col items-center justify-center rounded-2xl bg-black dark:bg-gray-300', {
        'size-12': size === 'xs',
        'size-16': size === 'sm',
        'size-24': size === 'base',
        'size-32': size === 'lg',
        'size-44': size === 'xl',
      })}
    >
      {src && !isError ? (
        <Image
          className="size-full rounded-2xl"
          source={{ uri: src }}
          alt="user-avatar"
          onError={() => setIsError(true)}
        />
      ) : (
        <Text
          className={cx('font-extrabold text-white dark:text-black', {
            'text-xl': size === 'xs',
            'text-2xl': size === 'sm',
            'text-5xl': size === 'base',
            'text-6xl': size === 'lg',
            'text-8xl': size === 'xl',
          })}
        >
          {username?.substring(0, 1).toUpperCase() || ''}
        </Text>
      )}
    </View>
  );
}
