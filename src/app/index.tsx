import { Text, View } from 'react-native';

import { env } from '@/config/env';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50">
      <Text className="text-5xl font-bold text-blue-600">DiNNo</Text>
      <Text className="mt-2 text-sm text-slate-500">API: {env.apiUrl}</Text>
    </View>
  );
}
