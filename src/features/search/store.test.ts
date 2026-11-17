import { toSearchQuery } from "./api.http";
import { useSearchStore } from "./store";

const signOutCleanups: (() => void)[] = [];
jest.mock("@/features/session/SessionProvider", () => ({
  onSignOut: (cleanup: () => void) => {
    signOutCleanups.push(cleanup);
    return () => undefined;
  },
}));

const CALLE_72 = { latitude: 4.6583, longitude: -74.0563 };

beforeEach(() => useSearchStore.getState().reset());

describe("search store", () => {
  it("starts with every restaurant: no position, no name, no filters", () => {
    expect(useSearchStore.getState()).toMatchObject({
      location: null,
      query: "",
      filters: {},
    });
  });

  it("the query has no radius: without the position, only the filters; with it, lat and lng", () => {
    expect(toSearchQuery(null, { category: "cafe" })).toEqual({
      category: "cafe",
      partySize: undefined,
    });
    useSearchStore.getState().setLocation(CALLE_72);
    const { location, filters } = useSearchStore.getState();
    expect(toSearchQuery(location, filters)).toEqual({
      lat: 4.6583,
      lng: -74.0563,
      category: undefined,
      partySize: undefined,
    });
    expect(toSearchQuery(location, filters)).not.toHaveProperty("radiusKm");
  });

  it("clearing filters keeps the position and the name; signing out forgets everything", () => {
    const { setLocation, setQuery, setCategory, setPartySize, clearFilters } =
      useSearchStore.getState();
    setLocation(CALLE_72);
    setQuery("casa");
    setCategory("italian");
    setPartySize(4);
    clearFilters();
    expect(useSearchStore.getState()).toMatchObject({
      location: CALLE_72,
      query: "casa",
      filters: {},
    });
    signOutCleanups.forEach((cleanup) => cleanup());
    expect(useSearchStore.getState()).toMatchObject({
      location: null,
      query: "",
    });
  });
});
