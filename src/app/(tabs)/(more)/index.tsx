import { useContext } from 'react';

import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Reanimated from 'react-native-reanimated';

import { useRouter } from 'expo-router';

import UserAvatar from '@/domain/users/components/avatar/UserAvatar';
import { useUser } from '@/domain/users/queries/users';
import { useUserEmployment } from '@/domain/users/queries/usersEmployments';
import { Icon } from '@/shared/components/Icon';
import { enterHero, enterPage } from '@/shared/components/motion/entering';
import { Card, ListGroup, ListItem, usePalette } from '@/shared/components/ui';
import dayjs from '@/shared/dayjs';
import { AuthContext } from '@/shared/providers/auth/AuthProvider';
import { ThemeContext } from '@/shared/providers/theme/ThemeProvider';

const DEFAULT_API_HOST = process.env.EXPO_PUBLIC_API_HOST;

const THEME_LABEL = { system: '시스템', light: '밝게', dark: '어둡게' } as const;

function RowIcon({ sf, fallback }: { sf: string; fallback: string }) {
  const palette = usePalette();

  return (
    <View className="bg-brand-subtle size-8 items-center justify-center rounded-[10px]">
      <Icon sf={sf} fallback={fallback} size={16} color={palette.brand} />
    </View>
  );
}

export default function MoreIndex() {
  // context
  const { userinfo, onLogout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  // hooks
  const router = useRouter();

  // queries
  const { user } = useUser(userinfo?.sub);
  const { employment } = useUserEmployment(userinfo?.sub);

  const tenure = employment?.effectiveDate
    ? dayjs
        .duration((dayjs().startOf('day').unix() - dayjs(employment.effectiveDate).unix()) * 1_000)
        .format('Y년 M개월')
    : '';

  // handle
  const handleLogout = () => {
    Alert.alert('로그아웃할까요?', '다시 로그인해야 출퇴근을 기록할 수 있어요.', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => onLogout() },
    ]);
  };

  return (
    <ScrollView
      className="size-full"
      contentContainerStyle={{ paddingBottom: 112 }}
      showsVerticalScrollIndicator={false}
    >
      <Reanimated.View entering={enterPage(0)}>
        <Text className="text-content dark:text-content-dark text-[28px] font-bold tracking-tight">더보기</Text>
      </Reanimated.View>

      {/* profile */}
      <Reanimated.View entering={enterHero(60)} className="mt-4">
        <Card className="flex-row items-center gap-4 p-4">
          <UserAvatar
            src={`${DEFAULT_API_HOST}/api/v1/users/${userinfo?.sub}/avatar`}
            username={user?.username}
            size="xs"
          />
          <View className="flex-1">
            <Text className="text-content dark:text-content-dark text-[17px] font-bold">{user?.username}</Text>
            <Text className="text-muted dark:text-muted-dark mt-0.5 text-xs">
              {[user?.group?.name, user?.position?.name, tenure && `입사 ${tenure}`].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </Card>
      </Reanimated.View>

      {/* settings */}
      <Reanimated.View entering={enterPage(140)} className="mt-6">
        <Text className="text-muted dark:text-muted-dark mb-2 text-[11px] font-semibold tracking-wider">설정</Text>
        <ListGroup>
          <ListItem
            left={<RowIcon sf="bell" fallback="🔔" />}
            label="알림 설정"
            onPress={() => router.push('./notifications')}
          />
          <ListItem
            left={<RowIcon sf="circle.lefthalf.filled" fallback="◐" />}
            label="화면 테마"
            value={THEME_LABEL[theme]}
            onPress={() => router.push('./theme')}
          />
        </ListGroup>
      </Reanimated.View>

      {/* logout */}
      <Reanimated.View entering={enterPage(220)} className="mt-8 items-center">
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          className="min-h-11 justify-center px-4"
          onPress={handleLogout}
        >
          <Text className="text-danger dark:text-danger-dark text-[15px] font-semibold">로그아웃</Text>
        </Pressable>
      </Reanimated.View>
    </ScrollView>
  );
}
