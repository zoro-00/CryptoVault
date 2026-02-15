import { NextRequest, NextResponse } from "next/server";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from "@/lib/api/notifications";

// GET /api/notifications - Get all notifications
// GET /api/notifications?unreadOnly=true - Get unread notifications
// GET /api/notifications?count=true - Get unread count
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "demo-user"; // In production, get from session
    const count = searchParams.get("count") === "true";
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (count) {
      const result = await getUnreadCount(userId);
      return NextResponse.json(result);
    }

    const result = await getNotifications(userId, { page, limit, unreadOnly });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/notifications - Create a notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "demo-user"; // In production, get from session

    const result = await createNotification({
      userId,
      title: body.title,
      message: body.message,
      type: body.type || "info",
      read: false,
      link: body.link,
      metadata: body.metadata,
    });

    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    console.error("Notifications POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "demo-user"; // In production, get from session

    if (body.markAll) {
      const result = await markAllAsRead(userId);
      return NextResponse.json(result);
    }

    if (!body.notificationId) {
      return NextResponse.json(
        { success: false, error: "notificationId is required" },
        { status: 400 },
      );
    }

    const result = await markAsRead(body.notificationId, userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/notifications?id=xxx - Delete a notification
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "demo-user"; // In production, get from session
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 },
      );
    }

    const result = await deleteNotification(notificationId, userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Notifications DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
