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
      actorName: actor.name || actor.email,
      actorRole: actor.role,
      eventType: "CATEGORY_CREATED",
      resource: "/api/v1/users/categories",
      status: "success",
      metadata: { type, name, parentId },
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
      actorName: actor.name || actor.email,
      actorRole: actor.role,
      eventType: "CATEGORY_UPDATED",
      resource: `/api/v1/users/categories/${id}`,
      status: "success",
      metadata: { type, name, parentId },
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
      actorName: actor.name || actor.email,
      actorRole: actor.role,
      eventType: "CATEGORY_DELETED",
      resource: `/api/v1/users/categories/${id}`,
      status: "success",
      metadata: { type, id },
    });
  }

  return result;
}
