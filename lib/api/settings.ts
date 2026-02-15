// User settings service
import type { UserSettings, ApiResponse } from "@/lib/types";

// In-memory storage for demo (replace with database in production)
let userSettings: Map<string, UserSettings> = new Map([
  [
    "demo-user",
    {
      userId: "demo-user",
      darkMode: true,
      notifications: true,
      priceAlerts: true,
      currency: "USD",
      language: "en",
      emailNotifications: true,
      pushNotifications: true,
      updatedAt: new Date(),
    },
  ],
]);

/**
 * Get user settings
 */
export async function getUserSettings(
  userId: string,
): Promise<ApiResponse<UserSettings>> {
  try {
    let settings = userSettings.get(userId);

    // Create default settings if none exist
    if (!settings) {
      settings = {
        userId,
        darkMode: true,
        notifications: true,
        priceAlerts: true,
        currency: "USD",
        language: "en",
        emailNotifications: true,
        pushNotifications: true,
        updatedAt: new Date(),
      };
      userSettings.set(userId, settings);
    }

    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error("Get settings error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get settings",
    };
  }
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  updates: Partial<Omit<UserSettings, "userId" | "updatedAt">>,
): Promise<ApiResponse<UserSettings>> {
  try {
    let settings = userSettings.get(userId);

    if (!settings) {
      // Create new settings if they don't exist
      settings = {
        userId,
        darkMode: true,
        notifications: true,
        priceAlerts: true,
        currency: "USD",
        language: "en",
        emailNotifications: true,
        pushNotifications: true,
        updatedAt: new Date(),
      };
    }

    // Update settings
    const updatedSettings: UserSettings = {
      ...settings,
      ...updates,
      userId, // Ensure userId doesn't change
      updatedAt: new Date(),
    };

    userSettings.set(userId, updatedSettings);

    return {
      success: true,
      data: updatedSettings,
      message: "Settings updated successfully",
    };
  } catch (error) {
    console.error("Update settings error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update settings",
    };
  }
}

/**
 * Reset user settings to defaults
 */
export async function resetUserSettings(
  userId: string,
): Promise<ApiResponse<UserSettings>> {
  try {
    const defaultSettings: UserSettings = {
      userId,
      darkMode: true,
      notifications: true,
      priceAlerts: true,
      currency: "USD",
      language: "en",
      emailNotifications: true,
      pushNotifications: true,
      updatedAt: new Date(),
    };

    userSettings.set(userId, defaultSettings);

    return {
      success: true,
      data: defaultSettings,
      message: "Settings reset to defaults",
    };
  } catch (error) {
    console.error("Reset settings error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reset settings",
    };
  }
}

/**
 * Toggle a specific setting
 */
export async function toggleSetting(
  userId: string,
  setting:
    | "darkMode"
    | "notifications"
    | "priceAlerts"
    | "emailNotifications"
    | "pushNotifications",
): Promise<ApiResponse<UserSettings>> {
  try {
    const settingsResult = await getUserSettings(userId);

    if (!settingsResult.success || !settingsResult.data) {
      return {
        success: false,
        error: "Failed to get user settings",
      };
    }

    const currentValue = settingsResult.data[setting];

    return await updateUserSettings(userId, {
      [setting]: !currentValue,
    });
  } catch (error) {
    console.error("Toggle setting error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to toggle setting",
    };
  }
}

/**
 * Update theme preference
 */
export async function updateTheme(
  userId: string,
  darkMode: boolean,
): Promise<ApiResponse<UserSettings>> {
  return updateUserSettings(userId, { darkMode });
}

/**
 * Update currency preference
 */
export async function updateCurrency(
  userId: string,
  currency: string,
): Promise<ApiResponse<UserSettings>> {
  return updateUserSettings(userId, { currency });
}

/**
 * Update language preference
 */
export async function updateLanguage(
  userId: string,
  language: string,
): Promise<ApiResponse<UserSettings>> {
  return updateUserSettings(userId, { language });
}
