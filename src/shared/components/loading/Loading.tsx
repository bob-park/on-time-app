import { View } from 'react-native';

import LoadingLottie from '@/assets/lotties/loading.json';

import LottieView from 'lottie-react-native';

export default function Loading() {
  return (
    <View className="flex size-full flex-col items-center justify-center gap-3">
      <LottieView style={{ width: 150, height: 150 }} source={LoadingLottie} autoPlay loop />
    </View>
  );
}
