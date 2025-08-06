import { useEffect, useState } from 'react';

import { Image, Text, TouchableOpacity, View } from 'react-native';

import { useAudioPlayer } from 'expo-audio';
import * as Crypto from 'expo-crypto';

import MagicalConchImg from '@/assets/images/magic_conch.png';
import SoundHold from '@/assets/sounds/magical-conch/negative/hold.mp3';
import SoundNo0 from '@/assets/sounds/magical-conch/negative/no-0.mp3';
import SoundNo1 from '@/assets/sounds/magical-conch/negative/no-1.mp3';
import SoundNo2 from '@/assets/sounds/magical-conch/negative/no-2.mp3';
import SoundNo3 from '@/assets/sounds/magical-conch/negative/no-3.mp3';
import SoundNo4 from '@/assets/sounds/magical-conch/negative/no-4.mp3';
import SoundThatNo from '@/assets/sounds/magical-conch/negative/thats-no.mp3';
import SoundRepeatTalk from '@/assets/sounds/magical-conch/other/repeat-talk.mp3';
import SoundThatYes from '@/assets/sounds/magical-conch/positive/thats-yes.mp3';
import SoundYes0 from '@/assets/sounds/magical-conch/positive/yes-0.mp3';
import SoundYes1 from '@/assets/sounds/magical-conch/positive/yes-1.mp3';
import SoundYes2 from '@/assets/sounds/magical-conch/positive/yes-2.mp3';
import SoundYes3 from '@/assets/sounds/magical-conch/positive/yes-3.mp3';
import SoundYes4 from '@/assets/sounds/magical-conch/positive/yes-4.mp3';

import cx from 'classnames';

const sounds = [
  SoundHold,
  SoundNo0,
  SoundNo1,
  SoundNo2,
  SoundNo3,
  SoundNo4,
  SoundThatNo,
  SoundRepeatTalk,
  SoundThatYes,
  SoundYes0,
  SoundYes1,
  SoundYes2,
  SoundYes3,
  SoundYes4,
];

const soundTexts = [
  '가만히 있어',
  '안돼',
  '안돼',
  '안돼',
  '안돼',
  '안돼',
  '그것도 안돼',
  '다시 한번 물어봐',
  '그럼',
  '돼',
  '돼',
  '돼',
  '돼',
  '돼',
];

function randomIndex() {
  const array = new Uint8Array(1);
  const value = Crypto.getRandomValues(array);

  return value[0] % sounds.length;
}

export default function MagicalConch() {
  // state
  const [randomSoundIndex, setRandomSoundIndex] = useState<number>();
  const [listening, setListening] = useState<boolean>(false);

  // hooks
  const player = useAudioPlayer(sounds[randomSoundIndex || 0]);

  console.log('randomSoundIndex', randomSoundIndex);

  // useEffect
  useEffect(() => {
    if (randomSoundIndex === undefined) {
      return;
    }

    player.seekTo(0);
    player.play();
  }, [randomSoundIndex]);

  // handle
  const handleRandomPlay = () => {
    if (player.playing) {
      return;
    }

    setListening(false);
    setRandomSoundIndex(randomIndex);
  };

  return (
    <View className="relative flex size-full flex-col items-center justify-center gap-10 bg-gray-50 dark:bg-gray-950">
      {/* description */}
      <View className="flex w-full flex-col items-center justify-center">
        <Text className="text-lg">
          <Text className="text-2xl font-black">🪄마법의 소라고동🪄</Text>
          <Text className="">님을 누르고 말을 해보세요.</Text>
        </Text>
        <Text className="text-lg">소라고동님이 대답해줄꺼에요.</Text>
      </View>

      {/* magical conch */}
      <TouchableOpacity
        className=""
        onPressIn={() => {
          setListening(true);
          setRandomSoundIndex(undefined);
        }}
        onPressOut={handleRandomPlay}
      >
        <Image className="" source={MagicalConchImg} alt="magical-conch" />
      </TouchableOpacity>

      {/* listening */}
      <View className="absolute top-10">
        <View
          className={cx(
            'flex flex-row items-center justify-center rounded-2xl bg-black/20 px-6 py-3 transition-all duration-300',
            listening ? 'visible' : 'invisible',
          )}
        >
          <Text className="text-2xl font-bold">듣는 중...</Text>
        </View>
      </View>

      {/* text */}
      <View className="absolute bottom-10">
        {!listening && randomSoundIndex !== undefined && (
          <View
            className={cx(
              'flex flex-row items-center justify-center rounded-2xl bg-black/15 px-6 py-3 transition-all duration-300',
            )}
          >
            <Text className="text-2xl font-bold">{soundTexts[randomSoundIndex]}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
