"use client";

import { ReactNode, useState, useEffect, Fragment } from "react";
import { cn } from "@/lib/utils";
import { FileCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/skeleton";

export interface Column<T> {
  header: ReactNode;
  accessorKey?: keyof T;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: any;
  keyExtractor: (item: T, index: number) => string;
  maxHeight?: string;
  className?: string;
  tableClassName?: string;
  enablePagination?: boolean;
  defaultPageSize?: number;
  minPageSize?: number;
  maxPageSize?: number;
  onRowClick?: (item: T, index: number) => void;
  renderSubRow?: (item: T, index: number) => ReactNode;
}

function clampPageSize(value: number, min: number, max: number) {
  const normalized = Number.isFinite(value) ? Math.trunc(value) : min;
  return Math.min(Math.max(normalized, min), max);
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  loadingMessage,
  emptyMessage,
  emptyDescription,
  emptyIcon,
  keyExtractor,
  maxHeight,
  className,
  tableClassName,
  enablePagination = true,
  defaultPageSize = 10,
  minPageSize = 1,
  maxPageSize = 500,
  onRowClick,
  renderSubRow,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const initialPageSize = clampPageSize(defaultPageSize, minPageSize, maxPageSize);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [pageSizeInput, setPageSizeInput] = useState(String(initialPageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, pageSize]);

  useEffect(() => {
    const nextPageSize = clampPageSize(defaultPageSize, minPageSize, maxPageSize);
    setPageSize(nextPageSize);
    setPageSizeInput(String(nextPageSize));
  }, [defaultPageSize, minPageSize, maxPageSize]);

  const applyPageSizeInput = () => {
    const nextPageSize = clampPageSize(Number(pageSizeInput), minPageSize, maxPageSize);
    setPageSize(nextPageSize);
    setPageSizeInput(String(nextPageSize));
  };

  if (isLoading) {
    return <TableSkeleton rows={5} cols={columns.length} className={className} />;
  }

  if (data.length === 0) {
    const Icon = emptyIcon || FileCheck;
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card">
        <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <h3 className="font-semibold text-lg">{emptyMessage || "Tidak ada data ditemukan"}</h3>
        {emptyDescription && (
          <p className="text-sm text-muted-foreground mt-1">{emptyDescription}</p>
        )}
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  
  const paginatedData = enablePagination
    ? data.slice((validCurrentPage - 1) * pageSize, validCurrentPage * pageSize)
    : data;

  const startItem = (validCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(validCurrentPage * pageSize, data.length);

  return (
    <div className="space-y-3">
      {/* Table Container */}
      <div
        className={cn(
          "w-full overflow-auto rounded-2xl border border-border bg-card shadow-sm relative",
          maxHeight || "max-h-[calc(100vh-280px)]",
          className
        )}
      >
        <table className={cn("w-full text-left text-sm border-collapse", tableClassName)}>
          <thead className="sticky top-0 z-10 bg-card border-b border-border text-muted-foreground font-semibold shadow-sm whitespace-nowrap">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn("px-4 py-3 bg-card whitespace-nowrap", col.headerClassName)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.map((item, index) => {
              const actualIndex = enablePagination ? (validCurrentPage - 1) * pageSize + index : index;
              const key = keyExtractor(item, actualIndex);
              const subRow = renderSubRow ? renderSubRow(item, actualIndex) : null;

              return (
                <Fragment key={key}>
                  <tr
                    onClick={() => onRowClick && onRowClick(item, actualIndex)}
                    className={cn("hover:bg-accent/30 transition-colors", onRowClick && "cursor-pointer group")}
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={cn("px-4 py-2.5", col.className)}>
                        {col.render
                          ? col.render(item, actualIndex)
                          : col.accessorKey
                          ? (item[col.accessorKey] as unknown as ReactNode)
                          : null}
                      </td>
                    ))}
                  </tr>
                  {subRow}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Bar */}
      {enablePagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border px-4 py-3 rounded-2xl shadow-sm text-xs">
          <div className="text-muted-foreground font-medium text-center sm:text-left">
            Menampilkan <span className="font-bold text-foreground">{startItem}</span> - <span className="font-bold text-foreground">{endItem}</span> dari <span className="font-bold text-foreground">{data.length}</span> data
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-muted-foreground font-medium">Tampilkan</span>
              <Input
                type="number"
                inputMode="numeric"
                min={minPageSize}
                max={maxPageSize}
                step={1}
                value={pageSizeInput}
                onChange={(e) => setPageSizeInput(e.target.value)}
                onBlur={applyPageSizeInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                aria-label="Jumlah data per halaman"
                className="h-8 w-20 rounded-xl px-2.5 py-1 text-center text-xs font-bold"
              />
              <span className="text-muted-foreground font-medium">data per halaman</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={validCurrentPage <= 1}
                className="h-8 w-8 p-0 rounded-xl border-border disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="px-3 py-1 font-bold text-foreground">
                Hal {validCurrentPage} dari {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={validCurrentPage >= totalPages}
                className="h-8 w-8 p-0 rounded-xl border-border disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
