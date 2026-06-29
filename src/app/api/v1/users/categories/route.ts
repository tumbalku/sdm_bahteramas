import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hasRole } from "@/lib/auth-utils";
import {
  getCategoriesService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from "@/modules/users/categories-service";
import { CategoryType } from "@/modules/users/categories-repository";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, ["ADMIN", "STAFF", "EMPLOYEE"])) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 403 }
      );
    }

    const data = await getCategoriesService();
    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": "private, max-age=300, stale-while-revalidate=600" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil master kategori" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Hanya ADMIN yang diizinkan." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { type, name, parentId } = body;

    if (!type || !name) {
      return NextResponse.json(
        { success: false, error: "Tipe dan Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const data = await createCategoryService(type as CategoryType, name, parentId, user);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat kategori" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Hanya ADMIN yang diizinkan." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, type, name, parentId } = body;

    if (!id || !type || !name) {
      return NextResponse.json(
        { success: false, error: "ID, Tipe, dan Nama wajib diisi" },
        { status: 400 }
      );
    }

    const data = await updateCategoryService(id, type as CategoryType, name, parentId, user);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui kategori" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Hanya ADMIN yang diizinkan." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") as CategoryType;

    if (!id || !type) {
      return NextResponse.json(
        { success: false, error: "ID dan Tipe wajib diberikan" },
        { status: 400 }
      );
    }

    const data = await deleteCategoryService(id, type, user);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
