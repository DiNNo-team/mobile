import { filterByName } from "./filters";
import { searchMockRestaurants } from "./api.mock";
import { MOCK_RESTAURANTS } from "./mock-data";

const CALLE_72 = { latitude: 4.6576, longitude: -74.0567 };

describe("mock search follows the backend rules (no radius)", () => {
  it("with the position: every searchable restaurant, nearest first, with its distance", () => {
    const results = searchMockRestaurants(CALLE_72, {});
    const searchable = MOCK_RESTAURANTS.filter(
      (restaurant) => restaurant.searchable,
    );
    expect(results).toHaveLength(searchable.length);
    const distances = results.map((result) => result.distanceKm as number);
    expect(distances.every((distance) => typeof distance === "number")).toBe(
      true,
    );
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it("without the position: the same restaurants by name, without distance", () => {
    const results = searchMockRestaurants(null, {});
    const names = results.map((result) => result.name);
    expect(names).toEqual(
      [...names].sort((a, b) =>
        a.localeCompare(b, "es", { sensitivity: "base" }),
      ),
    );
    expect(results.every((result) => result.distanceKm === null)).toBe(true);
  });

  it("never returns closed and covers the three search levels", () => {
    const levels = new Set(
      searchMockRestaurants(null, {}).map((result) => result.availability),
    );
    expect(levels).toEqual(new Set(["available", "few", "none"]));
  });

  it("filters by category and party size", () => {
    expect(
      searchMockRestaurants(null, { category: "italian" }).map((r) => r.name),
    ).toEqual(["Trattoria Quinta"]);
    const forSix = searchMockRestaurants(null, { partySize: 6 });
    expect(forSix.map((result) => result.name).sort()).toEqual([
      "Brasa Chapinero",
      "Casa 72",
      "Fonda Teusaquillo",
    ]);
  });
});

describe("filterByName («Buscar restaurante»)", () => {
  const results = searchMockRestaurants(null, {});

  it("keeps the names that contain the text, ignoring case, accents and spaces around it", () => {
    expect(filterByName(results, "  CASA ").map((r) => r.name)).toEqual([
      "Casa 72",
    ]);
    expect(filterByName(results, "trattoria").map((r) => r.name)).toEqual([
      "Trattoria Quinta",
    ]);
  });

  it("an empty text keeps them all; a name nobody has keeps none", () => {
    expect(filterByName(results, "   ")).toBe(results);
    expect(filterByName(results, "zzz")).toEqual([]);
  });

  it("accents do not matter, in the name or in the text", () => {
    const named = [{ ...results[0], name: "Café Ñam" }];
    expect(filterByName(named, "cafe nam")).toHaveLength(1);
    expect(filterByName(named, "CAFÉ")).toHaveLength(1);
  });
});
