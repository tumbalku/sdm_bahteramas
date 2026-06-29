import { AuthUser } from "@/lib/auth-utils";
import { logActivity } from "@/lib/security-log";
import * as repo from "./categories-repository";

export async function getCategoriesService() {
  return repo.findAllCategories();
}

export async function createCategoryService(
  type: repo.CategoryType,
  name: string,
  parentId?: string,
  actor?: AuthUser
) {
  const result = await repo.createCategoryItem(type, name, parentId);
  
  if (actor) {
    await logActivity({
      actorId: actor.id,
      actorEmail: actor.email,
      eventType: "USER_UPDATED",
      details: `Menambahkan master data kategori ${type}: ${name}`,
    });
  }

  return result;
}

export async function updateCategoryService(
  id: string,
  type: repo.CategoryType,
  name: string,
  parentId?: string,
  actor?: AuthUser
) {
  const result = await repo.updateCategoryItem(id, type, name, parentId);

  if (actor) {
    await logActivity({
      actorId: actor.id,
      actorEmail: actor.email,
      eventType: "USER_UPDATED",
      details: `Memperbarui master data kategori ${type} (${id}): ${name}`,
    });
  }

  return result;
}

export async function deleteCategoryService(
  id: string,
  type: repo.CategoryType,
  actor?: AuthUser
) {
  const result = await repo.deleteCategoryItem(id, type);

  if (actor) {
    await logActivity({
      actorId: actor.id,
      actorEmail: actor.email,
      eventType: "USER_UPDATED",
      details: `Menghapus master data kategori ${type} (${id})`,
    });
  }

  return result;
}
