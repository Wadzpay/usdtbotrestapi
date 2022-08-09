import { getPlaces } from "./providers/OpenCageDataProvider";

export const getPlacesByName = async (q: any) => {
  if (q.length < 3) {
    return {
      type: "FeatureCollection",
      features: []
    };
  }

  return await getPlaces(q);
};
