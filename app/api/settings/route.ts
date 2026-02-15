import { NextRequest, NextResponse } from "next/server";
import {
  getUserSettings,
  updateUserSettings,
  resetUserSettings,
  toggleSetting,
} from "@/lib/api/settings";

// GET /api/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "demo-user"; // In production, get from session

    const result = await getUserSettings(userId);
    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/settings - Update settings or toggle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "demo-user"; // In production, get from session

    // Handle toggle action
    if (body.action === "toggle" && body.setting) {
      const validSettings = [
        "darkMode",
        "notifications",
        "priceAlerts",
        "emailNotifications",
        "pushNotifications",
      ];

      if (!validSettings.includes(body.setting)) {
        return NextResponse.json(
          { success: false, error: "Invalid setting name" },
          { status: 400 },
        );
      }

      const result = await toggleSetting(userId, body.setting);
      return NextResponse.json(result);
    }

    // Handle reset action
    if (body.action === "reset") {
      const result = await resetUserSettings(userId);
      return NextResponse.json(result);
    }

    // Regular update
    const updates: any = {};

    if (typeof body.darkMode === "boolean") updates.darkMode = body.darkMode;
    if (typeof body.notifications === "boolean")
      updates.notifications = body.notifications;
    if (typeof body.priceAlerts === "boolean")
      updates.priceAlerts = body.priceAlerts;
    if (typeof body.emailNotifications === "boolean")
      updates.emailNotifications = body.emailNotifications;
    if (typeof body.pushNotifications === "boolean")
      updates.pushNotifications = body.pushNotifications;
    if (body.currency) updates.currency = body.currency;
    if (body.language) updates.language = body.language;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid settings to update" },
        { status: 400 },
      );
    }

    const result = await updateUserSettings(userId, updates);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/settings - Partial update
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "demo-user"; // In production, get from session

    const updates: any = {};

    if (typeof body.darkMode === "boolean") updates.darkMode = body.darkMode;
    if (typeof body.notifications === "boolean")
      updates.notifications = body.notifications;
    if (typeof body.priceAlerts === "boolean")
      updates.priceAlerts = body.priceAlerts;
    if (typeof body.emailNotifications === "boolean")
      updates.emailNotifications = body.emailNotifications;
    if (typeof body.pushNotifications === "boolean")
      updates.pushNotifications = body.pushNotifications;
    if (body.currency) updates.currency = body.currency;
    if (body.language) updates.language = body.language;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid settings to update" },
        { status: 400 },
      );
    }

    const result = await updateUserSettings(userId, updates);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Settings PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/settings - Reset to defaults
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "demo-user"; // In production, get from session

    const result = await resetUserSettings(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Settings DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
