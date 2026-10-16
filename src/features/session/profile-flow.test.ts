import type { AccountApi, Me } from '@/features/account/types';
import { ApiError, ErrorCode } from '@/lib/api/errors';

import { DISPLAY_NAME_MAX_LENGTH, resolveDinerProfile } from './profile-flow';

const diner: Me = { id: 'u1', email: 'ana@correo.com', displayName: 'Ana', role: 'diner', restaurantId: null };
const restaurant: Me = { ...diner, role: 'restaurant_admin', restaurantId: 'r1' };
const http = (status: number, errorCode?: string) => new ApiError({ status, kind: 'http', errorCode });

function fakeApi(getMe: () => Promise<Me>, createDinerProfile: AccountApi['createDinerProfile'] = async () => diner) {
  return { getMe: jest.fn(getMe), createDinerProfile: jest.fn(createDinerProfile) };
}

describe('resolveDinerProfile (single flow after sign-in)', () => {
  it('a diner with profile is ready', async () => {
    const api = fakeApi(async () => diner);
    await expect(resolveDinerProfile(api)).resolves.toEqual({ kind: 'diner', profile: diner });
    expect(api.createDinerProfile).not.toHaveBeenCalled();
  });

  it('PROFILE_REQUIRED creates the diner with the name and continues', async () => {
    const api = fakeApi(async () => {
      throw http(403, ErrorCode.ProfileRequired);
    });
    await expect(resolveDinerProfile(api, '  Ana María  ')).resolves.toEqual({ kind: 'diner', profile: diner });
    expect(api.createDinerProfile).toHaveBeenCalledWith({ displayName: 'Ana María' });
  });

  it('without a name lets the backend pick it (Google name or email)', async () => {
    const api = fakeApi(async () => {
      throw http(403, ErrorCode.ProfileRequired);
    });
    await resolveDinerProfile(api, '   ');
    expect(api.createDinerProfile).toHaveBeenCalledWith({});
  });

  it('cuts long names to the 60 characters the backend accepts', async () => {
    const api = fakeApi(async () => {
      throw http(403, ErrorCode.ProfileRequired);
    });
    await resolveDinerProfile(api, 'a'.repeat(80));
    expect(api.createDinerProfile.mock.calls[0][0].displayName).toHaveLength(DISPLAY_NAME_MAX_LENGTH);
  });

  it('a restaurant account: role from GET /me (200) or RESTAURANT_ACCOUNT from POST /diners/me', async () => {
    await expect(resolveDinerProfile(fakeApi(async () => restaurant))).resolves.toEqual({ kind: 'restaurant-account' });
    const api = fakeApi(
      async () => {
        throw http(403, ErrorCode.ProfileRequired);
      },
      async () => {
        throw http(403, ErrorCode.RestaurantAccount);
      },
    );
    await expect(resolveDinerProfile(api)).resolves.toEqual({ kind: 'restaurant-account' });
  });

  it('EMAIL_NOT_VERIFIED goes to verification, a plain 401 is an expired session', async () => {
    await expect(
      resolveDinerProfile(
        fakeApi(async () => {
          throw http(401, ErrorCode.EmailNotVerified);
        }),
      ),
    ).resolves.toEqual({ kind: 'email-not-verified' });
    await expect(
      resolveDinerProfile(
        fakeApi(async () => {
          throw http(401);
        }),
      ),
    ).resolves.toEqual({ kind: 'session-expired' });
  });

  it('network errors and 5xx leave the backend unreachable, with the error', async () => {
    const network = new ApiError({ status: 0, kind: 'network' });
    const result = await resolveDinerProfile(
      fakeApi(async () => {
        throw network;
      }),
    );
    expect(result).toEqual({ kind: 'unreachable', error: network });
    await expect(
      resolveDinerProfile(
        fakeApi(async () => {
          throw http(500);
        }),
      ),
    ).resolves.toMatchObject({ kind: 'unreachable' });
  });
});
