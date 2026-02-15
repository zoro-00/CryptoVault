import { NextRequest, NextResponse } from "next/server";
import {
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  authenticateUser,
  getDemoUser,
} from "@/lib/api/user";

// GET /api/user?id=xxx or GET /api/user?email=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("id");
    const email = searchParams.get("email");
    const demo = searchParams.get("demo") === "true";

    if (demo) {
      return NextResponse.json({
        success: true,
        data: getDemoUser(),
      });
    }

    if (userId) {
      const result = await getUserById(userId);
      return NextResponse.json(result, {
        status: result.success ? 200 : 404,
      });
    }

    if (email) {
      const result = await getUserByEmail(email);
      return NextResponse.json(result, {
        status: result.success ? 200 : 404,
      });
    }

    return NextResponse.json(
      { success: false, error: "Either 'id' or 'email' parameter is required" },
      { status: 400 },
    );
  } catch (error) {
    console.error("User GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/user - Create new user or authenticate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If it's an auth request
    if (body.action === "auth" || body.password) {
      if (!body.email || !body.password) {
        return NextResponse.json(
          { success: false, error: "Email and password are required" },
          { status: 400 },
        );
      }

      const result = await authenticateUser(body.email, body.password);
      return NextResponse.json(result, {
        status: result.success ? 200 : 401,
      });
    }

    // Create new user
    if (!body.email || !body.name) {
      return NextResponse.json(
        { success: false, error: "Email and name are required" },
        { status: 400 },
      );
    }

    const result = await createUser({
      email: body.email,
      name: body.name,
      avatar: body.avatar,
    });

    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    console.error("User POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/user - Update user
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "demo-user"; // In production, get from session

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    const result = await updateUser(userId, {
      name: body.name,
      avatar: body.avatar,
      email: body.email,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 404,
    });
  } catch (error) {
    console.error("User PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/user?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    const result = await deleteUser(userId);
    return NextResponse.json(result, {
      status: result.success ? 200 : 404,
    });
  } catch (error) {
    console.error("User DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
