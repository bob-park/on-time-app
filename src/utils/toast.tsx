import Toast from 'react-native-toast-message';

export function showToast({ title, description }: { title: string; description?: string }) {
  Toast.hide();
  Toast.show({
    type: 'selectedToast',
    text1: title,
    text2: description,
  });
}
