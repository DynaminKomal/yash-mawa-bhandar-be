/**
 * Utility functions for distance calculation and minimum order weight validation based on manufacturing center coordinates.
 */

// Default manufacturing center coordinates (can be overridden by process.env.PLANT_LATITUDE / process.env.PLANT_LONGITUDE)
export const DEFAULT_PLANT_LATITUDE = parseFloat(process.env.PLANT_LATITUDE || "29.0967");
export const DEFAULT_PLANT_LONGITUDE = parseFloat(process.env.PLANT_LONGITUDE || "77.2614");

export interface IManufacturingHub {
    id?: string;
    name?: string;
    latitude: number;
    longitude: number;
}

/**
 * Calculates the Haversine distance in kilometers between two coordinates (lat, lon).
 */
export const calculateHaversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number = DEFAULT_PLANT_LATITUDE,
    lon2: number = DEFAULT_PLANT_LONGITUDE
): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Multi-Hub Support: Calculates distance to the CLOSEST manufacturing hub out of all active hubs.
 */
export const calculateMinDistanceToNearestHub = (
    customerLat: number,
    customerLon: number,
    hubsList: IManufacturingHub[] = [
        { latitude: DEFAULT_PLANT_LATITUDE, longitude: DEFAULT_PLANT_LONGITUDE }
    ]
): { distanceKm: number; nearestHub: IManufacturingHub } => {
    if (!hubsList || hubsList.length === 0) {
        const defaultHub = { latitude: DEFAULT_PLANT_LATITUDE, longitude: DEFAULT_PLANT_LONGITUDE };
        return {
            distanceKm: calculateHaversineDistance(customerLat, customerLon, defaultHub.latitude, defaultHub.longitude),
            nearestHub: defaultHub
        };
    }

    let minDistance = Infinity;
    let closestHub = hubsList[0];

    for (const hub of hubsList) {
        const dist = calculateHaversineDistance(customerLat, customerLon, hub.latitude, hub.longitude);
        if (dist < minDistance) {
            minDistance = dist;
            closestHub = hub;
        }
    }

    return { distanceKm: minDistance, nearestHub: closestHub };
};

/**
 * Determines the minimum required order weight (in kg) based on distance from manufacturing center.
 * - Distance <= 5 km: 1 kg
 * - Distance > 5 km: 5 kg, then increases by 5 kg for every additional 10 km increment.
 */
export const calculateMinOrderWeight = (distanceKm: number): number => {
    if (distanceKm <= 5.0) {
        return 1;
    }

    const extraDistance = distanceKm - 5.0;
    const additional10KmSteps = Math.floor(extraDistance / 10);
    return 5 + additional10KmSteps * 5;
};

/**
 * Calculates total weight in KG from cart items.
 */
export const calculateCartTotalWeightInKg = (items: any[]): number => {
    if (!Array.isArray(items) || items.length === 0) return 0;

    let totalWeightKg = 0;
    for (const item of items) {
        const qty = item.quantity || 1;
        const unitType = (item.unitType || "kg").toLowerCase();

        if (unitType === "kg") {
            totalWeightKg += qty;
        } else if (unitType === "gram" || unitType === "g") {
            totalWeightKg += (qty * (item.packWeightGrams || 1000)) / 1000;
        } else {
            // Default 1 kg per pack/unit if specified or fallback
            totalWeightKg += qty * (item.weightInKg || 1);
        }
    }

    return totalWeightKg;
};

/**
 * Geocodes pincode / city / state to latitude and longitude.
 */
export const geocodeAddressOrPincode = async (
    pincode?: string,
    city?: string,
    state?: string,
    addressLine1?: string
): Promise<{ latitude: number; longitude: number } | null> => {
    try {
        const queryStr = [addressLine1, pincode, city, state, "India"].filter(Boolean).join(", ");
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryStr)}&format=json&limit=1`;
        const response = await fetch(url, {
            headers: {
                "User-Agent": "YashMawaBhandar/1.0"
            }
        });
        const data: any = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon)
            };
        }

        if (pincode) {
            const pincodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pincode + ", India")}&format=json&limit=1`;
            const pinRes = await fetch(pincodeUrl, {
                headers: {
                    "User-Agent": "YashMawaBhandar/1.0"
                }
            });
            const pinData: any = await pinRes.json();
            if (Array.isArray(pinData) && pinData.length > 0) {
                return {
                    latitude: parseFloat(pinData[0].lat),
                    longitude: parseFloat(pinData[0].lon)
                };
            }
        }
    } catch (err) {
        console.error("Backend geocoding failed:", err);
    }
    return null;
};
