export const APP_CONFIG = {
  isLaunched: process.env.NEXT_PUBLIC_IS_LAUNCHED === "true",
  appUrl:
    process.env.NEXT_PUBLIC_RIDE_URL || "https://ride.borarodar.app",
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL || "https://api.borarodar.app",
};
