"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { useDashboardCharts } from "../hooks";
import { DashboardChartItem } from "../types";
import { DashboardChartCard } from "./DashboardChartCard";
import { Skeleton } from "@/components/ui/skeleton";

const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#ea580c",
  "#475569",
];

const chartAreaHoverCursor = { fill: "hsl(var(--foreground))", fillOpacity: 0.08 };
const chartLineHoverCursor = { stroke: "hsl(var(--foreground))", strokeOpacity: 0.35 };

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function EmptyChart({ message = "Belum ada data untuk ditampilkan." }: { message?: string }) {
  return (
    <div className="h-[180px] flex flex-col items-center justify-center text-center text-muted-foreground">
      <BarChart3 className="w-8 h-8 mb-2 opacity-30" />
      <p className="text-xs font-semibold">{message}</p>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-[170px] w-full rounded-xl" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-2.5 rounded-full" />
        <Skeleton className="h-2.5 rounded-full" />
        <Skeleton className="h-2.5 rounded-full" />
      </div>
    </div>
  );
}

function tooltipFormatter(value: unknown) {
  return [formatNumber(Number(value || 0)), "Jumlah"];
}

function SimpleBarChart({ data, color = CHART_COLORS[0] }: { data: DashboardChartItem[]; color?: string }) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 2, right: 8, left: 0, bottom: 2 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
          <YAxis
            type="category"
            dataKey="label"
            width={82}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip formatter={tooltipFormatter} cursor={chartAreaHoverCursor} />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DonutChart({ data }: { data: DashboardChartItem[] }) {
  if (data.length === 0) return <EmptyChart />;

  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={38}
            outerRadius={66}
            paddingAngle={2}
            label={({ name, value }) => `${name}: ${formatNumber(Number(value || 0))}`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={tooltipFormatter} />
          <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 10 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DashboardChartsSection({ isAdmin }: { isAdmin: boolean }) {
  const { data, isLoading, error } = useDashboardCharts(isAdmin);

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <DashboardChartCard key={index} title="Memuat analytics" description="Menyiapkan data chart dashboard">
            <ChartSkeleton />
          </DashboardChartCard>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl p-4 text-sm font-semibold">
        Gagal memuat analytics dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-foreground">Analytics Admin</h2>
          <p className="text-xs text-muted-foreground">
            Statistik pegawai dan dokumen berbasis agregasi ringan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
        <DashboardChartCard
          title="Pegawai per Status Kepegawaian"
          description="Jumlah pegawai berdasarkan status utama"
        >
          <SimpleBarChart data={data.employeeByEmploymentStatus} color={CHART_COLORS[0]} />
        </DashboardChartCard>

        <DashboardChartCard
          title="Pegawai per Jenis Kepegawaian"
          description="Top jenis kepegawaian berdasarkan jumlah pegawai"
        >
          <SimpleBarChart data={data.employeeByEmployeeGroup} color={CHART_COLORS[1]} />
        </DashboardChartCard>

        <DashboardChartCard
          title="Pegawai per Jenis Kelamin"
          description="Distribusi pegawai berdasarkan data gender"
        >
          <DonutChart data={data.employeeByGender} />
        </DashboardChartCard>

        <DashboardChartCard
          title="Status Verifikasi Dokumen"
          description="Ringkasan dokumen menunggu, disetujui, dan ditolak"
        >
          <DonutChart data={data.verificationStatusSummary} />
        </DashboardChartCard>

        <DashboardChartCard
          title="Upload Dokumen 6 Bulan Terakhir"
          description="Stacked berdasarkan jenis dokumen terbanyak"
          className="md:col-span-2"
        >
          {data.documentUploadsByTypeLastSixMonths.length === 0 || data.documentUploadTypeKeys.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.documentUploadsByTypeLastSixMonths} margin={{ top: 4, right: 8, left: 0, bottom: 2 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={tooltipFormatter} cursor={chartAreaHoverCursor} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {data.documentUploadTypeKeys.map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId="documents"
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      radius={index === data.documentUploadTypeKeys.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardChartCard>

        <DashboardChartCard
          title="Tren Upload Bulanan"
          description="Total upload dokumen per bulan"
        >
          {data.monthlyUploadTrend.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyUploadTrend} margin={{ top: 4, right: 10, left: 0, bottom: 2 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={tooltipFormatter} cursor={chartLineHoverCursor} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke={CHART_COLORS[0]}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Upload"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardChartCard>

        <DashboardChartCard
          title="Top Dokumen Wajib Belum Upload"
          description="Jenis dokumen wajib yang paling banyak belum dipenuhi"
        >
          <SimpleBarChart data={data.missingMandatoryDocumentsTop} color={CHART_COLORS[3]} />
        </DashboardChartCard>

        <DashboardChartCard
          title="Dokumen Hampir Kedaluwarsa"
          description="Dokumen approved yang akan kedaluwarsa"
        >
          <SimpleBarChart
            data={data.expiringDocumentsSummary.map((item) => ({ label: item.label, value: item.value }))}
            color={CHART_COLORS[2]}
          />
        </DashboardChartCard>

        <DashboardChartCard
          title="Pegawai per Unit Kerja"
          description="Top unit kerja berdasarkan jumlah pegawai"
        >
          <SimpleBarChart data={data.employeeByWorkplace} color={CHART_COLORS[5]} />
        </DashboardChartCard>
      </div>
    </div>
  );
}
