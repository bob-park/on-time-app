import { DevToolsBubble } from 'react-native-react-query-devtools';

import * as Clipboard from 'expo-clipboard';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function RQProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retryOnMount: true,
        refetchOnReconnect: true,
        staleTime: 60 * 1_000,
        gcTime: 120 * 1_000,
      },
    },
  });

  // handle
  const handleCopy = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {__DEV__ && <DevToolsBubble onCopy={handleCopy} queryClient={queryClient} />}
    </QueryClientProvider>
  );
}
