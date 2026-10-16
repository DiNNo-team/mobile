import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { errorMessages } from '@/lib/api/errors';

export default function RestaurantAccountScreen() {
  return (
    <ScreenPlaceholder
      title="Cuenta de restaurante"
      description={errorMessages.restaurantAccount}
      owner="Sebastián · fase 3"
    />
  );
}
