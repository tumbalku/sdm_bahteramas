"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { DataType } from "@/modules/users/components/CategoryFormModal";

export interface SubCategoryItem {
  id: string;
  name: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  children?: SubCategoryItem[];
}

interface MasterCategoryCardProps {
  title: string;
  icon: React.ElementType;
  iconColorClass: string;
  badgeDotColorClass?: string;
  countLabel: string;
  emptyText: string;
  emptySubText?: string;
  items: CategoryItem[];
  parentType: DataType;
  childType?: DataType;
  onEdit: (id: string, name: string, type: DataType, parentId?: string) => void;
  onDelete: (id: string, type: DataType, name: string) => void;
}

export function MasterCategoryCard({
  title,
  icon: Icon,
  iconColorClass,
  badgeDotColorClass = "bg-primary",
  countLabel,
  emptyText,
  emptySubText = "Belum ada sub-item untuk entri ini.",
  items,
  parentType,
  childType,
  onEdit,
  onDelete,
}: MasterCategoryCardProps) {
  const isHierarchical = !!childType;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
        <h4 className="font-bold flex items-center gap-2 text-foreground text-sm sm:text-base">
          <Icon className={`w-5 h-5 ${iconColorClass}`} />
          {title}
        </h4>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {countLabel}
        </span>
      </div>

      {/* Card Body with Fixed Max Height & Vertical Scroll */}
      <div className="flex-1 overflow-y-auto max-h-80 pr-2 space-y-3 custom-scrollbar">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-8 text-center">
            {emptyText}
          </p>
        ) : isHierarchical ? (
          /* Render Hierarchical (Parent + Child) Items */
          items.map((item) => (
            <div key={item.id} className="border border-border rounded-xl p-3.5 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${badgeDotColorClass}`} />
                  <span className="line-clamp-1">{item.name}</span>
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    onClick={() => onEdit(item.id, item.name, parentType)}
                    title="Edit Data"
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-destructive/10"
                    onClick={() => onDelete(item.id, parentType, item.name)}
                    title="Hapus Data"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Sub-items list */}
              <div className="mt-2.5 pl-3 space-y-1.5 border-l-2 border-border/80 ml-1">
                {item.children && item.children.length > 0 ? (
                  item.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-background border border-border/60 text-xs"
                    >
                      <span className="flex items-center gap-1.5 text-muted-foreground min-w-0 pr-2">
                        <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground truncate">{child.name}</span>
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md"
                          onClick={() => onEdit(child.id, child.name, childType, item.id)}
                          title="Edit Sub-item"
                        >
                          <Pencil className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md hover:bg-destructive/10"
                          onClick={() => onDelete(child.id, childType, child.name)}
                          title="Hapus Sub-item"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic py-1 pl-1">
                    {emptySubText}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          /* Render Flat Single-Level Items */
          <div className="space-y-1.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30 border border-border text-xs sm:text-sm"
              >
                <span className="font-medium truncate pr-2">{item.name}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md"
                    onClick={() => onEdit(item.id, item.name, parentType)}
                    title="Edit Data"
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md hover:bg-destructive/10"
                    onClick={() => onDelete(item.id, parentType, item.name)}
                    title="Hapus Data"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
