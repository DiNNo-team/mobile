import { Tabs } from 'expo-router/js-tabs';
import { CircleUserRound, Search } from 'lucide-react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { textExtras } from '@/theme/tokens';

const ICON_SIZE = 24;
const ICON_STROKE = 1.75;

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentText,
        tabBarInactiveTintColor: colors.text2,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: textExtras.chip.fontFamily, fontSize: textExtras.chip.fontSize },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <Search color={color} size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <CircleUserRound color={color} size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
        }}
      />
    </Tabs>
  );
}
