"use client";

import {useMemo, useState} from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  AlertTriangle,
  Archive,
  Award,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  FileCheck2,
  FileClock,
  FileText,
  GraduationCap,
  Heart,
  Layers3,
  PieChart as PieChartIcon,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import {useDashboardCharts} from "../hooks";
import {
  DashboardChartItem,
  DashboardGroupedChartItem,
  DashboardMonthlyUploadByType,
  DashboardUploadTrendItem
} from "../types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { cn } from "@/lib/utils";

const CHART_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];
const STATUS_COLORS: Record<string, string> = {
  Approved: "#10b981",
  Pending: "#f59e0b",
  Rejected: "#ef4444",
  Disetujui: "#10b981",
  Menunggu: "#f59e0b",
  Ditolak: "#ef4444",
  "Laki-laki": "#2563eb",
  Perempuan: "#ec4899",
};

type StatisticsTab = "overview" | "employees" | "documents";

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function mapStatusLabel(label: string) {
  if (label === "Disetujui") return "Approved";
  if (label === "Menunggu") return "Pending";
  if (label === "Ditolak") return "Rejected";
  return label;
}

function sumValues(items: DashboardChartItem[]) {
  return items.reduce((total, item) => total + item.value, 0);
}

function toPercent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function ChartTooltip({
                        active,
                        payload,
                        label,
                      }: {
  active?: boolean;
  payload?: Array<{
    color?: string;
    fill?: string;
    name?: string;
    value?: number | string;
    dataKey?: string;
    payload?: Record<string, unknown>
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="max-w-[260px] rounded-xl border border-border bg-background px-3 py-2 shadow-lg">
      {label && <p className="mb-1 text-xs font-semibold text-foreground">{label}</p>}
      <div className="space-y-1">
        {payload.map((item) => {
          const value = Number(item.payload?.count ?? item.value ?? 0);
          return (
            <div key={`${item.dataKey}-${item.name}`}
                 className="flex min-w-32 items-center justify-between gap-4 text-xs">
              <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{backgroundColor: item.color || item.fill}}/>
                <span className="truncate">{item.name || item.dataKey || "Jumlah"}</span>
              </span>
              <span className="font-semibold text-foreground">{formatNumber(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyChart({message = "Belum ada data untuk ditampilkan."}: { message?: string }) {
  return (
    <div
      className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center text-muted-foreground">
      <BarChart3 className="mb-2 h-8 w-8 opacity-40"/>
      <p className="text-xs font-semibold">{message}</p>
    </div>
  );
}

function ChartCard({
                     title,
                     description,
                     icon: Icon,
                     children,
                     className,
                   }: {
  title: string;
  description: string;
  icon: typeof FileText;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden rounded-2xl border-border shadow-sm", className)}>
      <CardHeader className="border-b border-border/70 bg-muted/20 p-4 pb-3 sm:p-5 sm:pb-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4"/>
          </div>
          <div className="min-w-0">
            <CardTitle className="text-sm font-extrabold leading-tight">{title}</CardTitle>
            <CardDescription className="mt-1 text-[11px] leading-snug">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">{children}</CardContent>
    </Card>
  );
}

function UploadAreaChart({data}: { data: DashboardUploadTrendItem[] }) {
  if (data.length === 0) return <EmptyChart/>;

  return (
    <div className="h-[240px] w-full sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{top: 8, right: 14, left: -18, bottom: 0}}>
          <defs>
            <linearGradient id="uploadArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} opacity={0.7}/>
          <XAxis dataKey="month" axisLine={false} tickLine={false}
                 tick={{fontSize: 11, fill: "hsl(var(--muted-foreground))"}}/>
          <YAxis allowDecimals={false} axisLine={false} tickLine={false}
                 tick={{fontSize: 11, fill: "hsl(var(--muted-foreground))"}}/>
          <Tooltip content={<ChartTooltip/>}/>
          <Area type="monotone" dataKey="total" name="Upload" stroke="#2563eb" strokeWidth={2.5} fill="url(#uploadArea)"
                dot={{r: 3, fill: "#2563eb"}} activeDot={{r: 5}}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusDonutChart({data}: { data: DashboardChartItem[] }) {
  if (data.length === 0) return <EmptyChart/>;
  const total = sumValues(data);

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_150px] md:items-center">
      <div className="relative h-[230px] w-full sm:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius="58%" outerRadius="78%" paddingAngle={3}
                 stroke="hsl(var(--background))" strokeWidth={4}>
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={STATUS_COLORS[entry.label] || CHART_COLORS[index % CHART_COLORS.length]}/>
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip/>}/>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-tight">{formatNumber(total)}</span>
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">Dokumen</span>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-1">
        {data.map((item, index) => {
          const color = STATUS_COLORS[item.label] || CHART_COLORS[index % CHART_COLORS.length];
          return (
            <div key={item.label}
                 className="flex items-center justify-between gap-3 rounded-xl bg-muted/30 px-3 py-2 text-xs">
              <span className="flex min-w-0 items-center gap-2 font-semibold">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{backgroundColor: color}}/>
                <span className="truncate">{item.label}</span>
              </span>
              <span className="font-bold">{toPercent(item.value, total)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GroupedDocumentBarChart({data, keys}: { data: DashboardMonthlyUploadByType[]; keys: string[] }) {
  if (data.length === 0 || keys.length === 0) return <EmptyChart/>;

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{top: 8, right: 14, left: -18, bottom: 0}}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} opacity={0.7}/>
          <XAxis dataKey="month" axisLine={false} tickLine={false}
                 tick={{fontSize: 11, fill: "hsl(var(--muted-foreground))"}}/>
          <YAxis allowDecimals={false} axisLine={false} tickLine={false}
                 tick={{fontSize: 11, fill: "hsl(var(--muted-foreground))"}}/>
          <Tooltip cursor={{fill: "hsl(var(--muted))", opacity: 0.25}} content={<ChartTooltip/>}/>
          <Legend wrapperStyle={{fontSize: 11, paddingTop: 12}} iconType="circle"/>
          {keys.map((key, index) => (
            <Bar key={key} dataKey={key} name={key} fill={CHART_COLORS[index % CHART_COLORS.length]}
                 radius={[6, 6, 0, 0]} barSize={18}/>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function WorkplaceTreemap({data}: { data: DashboardChartItem[] }) {
  if (data.length === 0) return <EmptyChart/>;

  const treeData = data.slice(0, 10).map((item, index) => ({
    name: item.label,
    size: item.value,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treeData}
          dataKey="size"
          nameKey="name"
          aspectRatio={4 / 3}
          stroke="hsl(var(--background))"
          fill="#2563eb"
          content={({x, y, width, height, name, size, fill}) => {
            if (!width || !height || width < 50 || height < 36) return <g/>;
            return (
              <g>
                <rect x={x} y={y} width={width} height={height} rx={10} ry={10} fill={String(fill)} opacity={0.92}/>
                <text x={Number(x) + 12} y={Number(y) + 20} fill="#fff" fontSize={12} fontWeight={700}>
                  {String(name).slice(0, 20)}
                </text>
                <text x={Number(x) + 12} y={Number(y) + 38} fill="#fff" fontSize={12} opacity={0.95}>
                  {formatNumber(Number(size || 0))} pegawai
                </text>
              </g>
            );
          }}
        >
          <Tooltip content={<ChartTooltip/>}/>
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

function EmployeeGroupRadarChart({data}: { data: DashboardChartItem[] }) {
  if (data.length === 0) return <EmptyChart/>;
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const radarData = data.slice(0, 8).map((item) => ({label: item.label, value: item.value, fullMark: maxValue}));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} margin={{top: 12, right: 28, left: 28, bottom: 12}}>
          <PolarGrid stroke="hsl(var(--border))" strokeWidth={1.2}/>
          <PolarAngleAxis dataKey="label" tick={{fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 600}}/>
          <Tooltip content={<ChartTooltip/>}/>
          <Radar name="Pegawai" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.28} strokeWidth={2.5}
                 dot={{r: 4, fill: "#8b5cf6", strokeWidth: 0}}/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function GenderDonutChart({data}: { data: DashboardChartItem[] }) {
  if (data.length === 0) return <EmptyChart/>;
  const total = sumValues(data);

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_150px] md:items-center">
      <div className="relative h-[230px] w-full sm:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius="58%" outerRadius="78%" paddingAngle={3}
                 stroke="hsl(var(--background))" strokeWidth={4}>
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={STATUS_COLORS[entry.label] || CHART_COLORS[index % CHART_COLORS.length]}/>
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip/>}/>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-tight">{formatNumber(total)}</span>
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">Pegawai</span>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
        {data.map((item, index) => {
          const color = STATUS_COLORS[item.label] || CHART_COLORS[index % CHART_COLORS.length];
          return (
            <div key={item.label}
                 className="flex items-center justify-between gap-3 rounded-xl bg-muted/30 px-3 py-2 text-xs">
              <span className="flex min-w-0 items-center gap-2 font-semibold">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{backgroundColor: color}}/>
                <span className="truncate">{item.label}</span>
              </span>
              <span className="font-bold">{toPercent(item.value, total)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmploymentBubbleChart({data}: { data: DashboardChartItem[] }) {
  if (data.length === 0) return <EmptyChart/>;
  const scatterData = data.map((item, index) => ({
    label: item.label,
    x: index + 1,
    y: item.value,
    z: Math.max(item.value * 1.2, 1),
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{top: 16, right: 18, left: -18, bottom: 8}}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} opacity={0.7}/>
          <XAxis type="number" dataKey="x" domain={[0, scatterData.length + 1]} tick={false} axisLine={false}
                 tickLine={false}/>
          <YAxis type="number" dataKey="y" allowDecimals={false} axisLine={false} tickLine={false}
                 tick={{fontSize: 11, fill: "hsl(var(--muted-foreground))"}}/>
          <ZAxis type="number" dataKey="z" range={[200, 1400]}/>
          <Tooltip cursor={{strokeDasharray: "3 3"}} content={<ChartTooltip/>}/>
          <Scatter name="Status" data={scatterData} fillOpacity={0.85}>
            {scatterData.map((entry) => (
              <Cell key={entry.label} fill={entry.fill}/>
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-2">
        {scatterData.map((item) => (
          <Badge key={item.label} variant="outline" className="rounded-full text-[10px] font-semibold">
            <span className="mr-1.5 h-2 w-2 rounded-full" style={{backgroundColor: item.fill}}/>
            {item.label}: {formatNumber(item.y)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function MissingMandatoryChart({data}: { data: DashboardChartItem[] }) {
  if (data.length === 0) return <EmptyChart/>;
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const chartData = data.slice(0, 8).map((item) => ({
    label: item.label.length > 12 ? `${item.label.slice(0, 12)}...` : item.label,
    fullLabel: item.label,
    value: item.value,
    gapRate: toPercent(item.value, maxValue),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{top: 8, right: 18, left: -18, bottom: 0}}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} opacity={0.7}/>
          <XAxis dataKey="label" axisLine={false} tickLine={false}
                 tick={{fontSize: 10, fill: "hsl(var(--muted-foreground))"}}/>
          <YAxis yAxisId="left" allowDecimals={false} axisLine={false} tickLine={false}
                 tick={{fontSize: 11, fill: "hsl(var(--muted-foreground))"}}/>
          <YAxis yAxisId="right" orientation="right" hide domain={[0, 100]}/>
          <Tooltip content={<ChartTooltip/>}/>
          <Bar yAxisId="left" dataKey="value" name="Belum Upload" fill="#ef4444" radius={[7, 7, 0, 0]} barSize={22}/>
          <Line yAxisId="right" type="monotone" dataKey="gapRate" name="Skor Gap" stroke="#f59e0b" strokeWidth={2.5}
                dot={{r: 3, fill: "#f59e0b"}}/>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function ExpiryLineChart({data}: { data: DashboardChartItem[] }) {
  if (data.length === 0) return <EmptyChart/>;

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{top: 8, right: 14, left: -18, bottom: 0}}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} opacity={0.7}/>
          <XAxis dataKey="label" axisLine={false} tickLine={false}
                 tick={{fontSize: 11, fill: "hsl(var(--muted-foreground))"}}/>
          <YAxis allowDecimals={false} axisLine={false} tickLine={false}
                 tick={{fontSize: 11, fill: "hsl(var(--muted-foreground))"}}/>
          <Tooltip content={<ChartTooltip/>}/>
          <Line type="monotone" dataKey="value" name="Dokumen" stroke="#f59e0b" strokeWidth={2.5}
                dot={{r: 4, fill: "#f59e0b"}} activeDot={{r: 6}}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatusBreakdownPanel({data}: { data: DashboardChartItem[] }) {
  const total = sumValues(data);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {data.map((item, index) => {
        const color = STATUS_COLORS[item.label] || CHART_COLORS[index % CHART_COLORS.length];
        return (
          <div key={item.label} className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: color}}/>
              <span className="text-xs font-bold text-muted-foreground">{toPercent(item.value, total)}%</span>
            </div>
            <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-2xl font-black tracking-tight">{formatNumber(item.value)}</p>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBarChart({data, color = "#2563eb"}: { data: DashboardChartItem[]; color?: string }) {
  if (data.length === 0) return <EmptyChart/>;
  const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 10);

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} layout="vertical" margin={{top: 8, right: 18, left: -8, bottom: 8}}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" horizontal={false} opacity={0.7}/>
          <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false}
                 tick={{fontSize: 11, fill: "hsl(var(--muted-foreground))"}}/>
          <YAxis type="category" dataKey="label" axisLine={false} tickLine={false}
                 tick={{fontSize: 10, fill: "hsl(var(--muted-foreground))"}} width={120}/>
          <Tooltip content={<ChartTooltip/>}/>
          <Bar dataKey="value" name="Jumlah" fill={color} radius={[0, 6, 6, 0]} barSize={20}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SimpleDonutChart({data, centerLabel}: { data: DashboardChartItem[]; centerLabel: string }) {
  if (data.length === 0) return <EmptyChart/>;
  const total = sumValues(data);

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px] md:items-center">
      <div className="relative h-[230px] w-full sm:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius="58%" outerRadius="78%" paddingAngle={3}
                 stroke="hsl(var(--background))" strokeWidth={4}>
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]}/>
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip/>}/>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-tight">{formatNumber(total)}</span>
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
        {data.map((item, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length];
          return (
            <div key={item.label}
                 className="flex items-center justify-between gap-3 rounded-xl bg-muted/30 px-3 py-2 text-xs">
              <span className="flex min-w-0 items-center gap-2 font-semibold">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{backgroundColor: color}}/>
                <span className="truncate">{item.label}</span>
              </span>
              <span className="font-bold">{toPercent(item.value, total)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SimplePieChart({data}: { data: DashboardChartItem[] }) {
  if (data.length === 0) return <EmptyChart/>;
  const total = sumValues(data);

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px] md:items-center">
      <div className="h-[230px] w-full sm:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" outerRadius="80%" paddingAngle={2}
                 stroke="hsl(var(--background))" strokeWidth={3}>
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]}/>
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip/>}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
        {data.map((item, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length];
          return (
            <div key={item.label}
                 className="flex items-center justify-between gap-3 rounded-xl bg-muted/30 px-3 py-2 text-xs">
              <span className="flex min-w-0 items-center gap-2 font-semibold">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{backgroundColor: color}}/>
                <span className="truncate">{item.label}</span>
              </span>
              <span className="font-bold">{formatNumber(item.value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgeGroupBarChart({data}: { data: DashboardChartItem[] }) {
  if (data.length === 0) return <EmptyChart/>;

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{top: 8, right: 14, left: -18, bottom: 0}}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} opacity={0.7}/>
          <XAxis dataKey="label" axisLine={false} tickLine={false}
                 tick={{fontSize: 10, fill: "hsl(var(--muted-foreground))"}}/>
          <YAxis allowDecimals={false} axisLine={false} tickLine={false}
                 tick={{fontSize: 11, fill: "hsl(var(--muted-foreground))"}}/>
          <Tooltip content={<ChartTooltip/>}/>
          <Bar dataKey="value" name="Pegawai" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]}/>
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function GenderGroupedBarChart({data}: { data: DashboardGroupedChartItem[] }) {
  if (data.length === 0) return <EmptyChart/>;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{top: 8, right: 14, left: -18, bottom: 0}}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} opacity={0.7}/>
          <XAxis dataKey="category" axisLine={false} tickLine={false}
                 tick={{fontSize: 11, fill: "hsl(var(--muted-foreground))"}}/>
          <YAxis allowDecimals={false} axisLine={false} tickLine={false}
                 tick={{fontSize: 11, fill: "hsl(var(--muted-foreground))"}}/>
          <Tooltip cursor={{fill: "hsl(var(--muted))", opacity: 0.2}} content={<ChartTooltip/>}/>
          <Legend wrapperStyle={{fontSize: 11, paddingTop: 12}} iconType="circle"/>
          <Bar dataKey="Laki-laki" name="Laki-laki" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={16}/>
          <Bar dataKey="Perempuan" name="Perempuan" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={16}/>
          <Bar dataKey="Belum Diisi" name="Belum Diisi" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={16}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="page-container space-y-6 pb-8 animate-fade-in">
      <div className="flex items-center gap-4 border-b border-border/60 pb-4">
        <Skeleton className="h-12 w-12 rounded-2xl"/>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-56 rounded-lg"/>
          <Skeleton className="h-4 w-full max-w-96 rounded-lg"/>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({length: 4}).map((_, index) => <Skeleton key={index} className="h-28 rounded-xl"/>)}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-2xl lg:col-span-2"/>
        <Skeleton className="h-96 rounded-2xl"/>
      </div>
    </div>
  );
}

export function StatisticsView() {
  const {data, isLoading, error} = useDashboardCharts(true);
  const [activeTab, setActiveTab] = useState<StatisticsTab>("overview");

  const summary = useMemo(() => {
    if (!data) return null;

    const statusSummary = data.verificationStatusSummary.map((item) => ({...item, label: mapStatusLabel(item.label)}));
    const approved = statusSummary.find((item) => item.label === "Approved")?.value || 0;
    const pending = statusSummary.find((item) => item.label === "Pending")?.value || 0;
    const rejected = statusSummary.find((item) => item.label === "Rejected")?.value || 0;
    const total = approved + pending + rejected;
    const employees = sumValues(data.employeeByGender);
    const expiringSoon = data.expiringDocumentsSummary.find((item) => item.days === 30)?.value || 0;
    const completionRate = total ? Math.round((approved / total) * 100) : 0;

    return {approved, pending, rejected, total, employees, expiringSoon, completionRate, statusSummary};
  }, [data]);

  if (isLoading) return <LoadingState/>;

  if (error || !data || !summary) {
    return (
      <div
        className="page-container mx-auto mt-10 max-w-lg rounded-3xl border border-destructive/20 bg-destructive/10 p-8 text-center text-destructive">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8"/>
        <p className="font-semibold">Gagal memuat data statistik global</p>
        <p className="mt-1 text-sm opacity-80">Silakan muat ulang halaman ini atau hubungi administrator.</p>
      </div>
    );
  }

  const tabs: Array<{ id: StatisticsTab; label: string; icon: typeof FileText }> = [
    {id: "overview", label: "Ringkasan", icon: TrendingUp},
    {id: "employees", label: "Pegawai", icon: Users},
    {id: "documents", label: "Dokumen", icon: FileText},
  ];

  const expiringChartData = data.expiringDocumentsSummary.map((item) => ({label: item.label, value: item.value}));

  return (
    <div className="page-container space-y-6 pb-8 animate-fade-in">
      <PageHeader
        icon={BarChart3}
        title="Statistik Kepegawaian"
        description="Pantau tren dokumen, demografi pegawai, dan kepatuhan arsip secara operasional"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Dokumen"
          value={summary.total}
          icon={FileText}
          iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          description="Dokumen yang masuk sistem"
        />
        <StatsCard
          title="Menunggu"
          value={summary.pending}
          icon={Clock}
          iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
          description="Perlu diverifikasi staf"
        />
        <StatsCard
          title="Disetujui"
          value={summary.approved}
          icon={CheckCircle}
          iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          description="Sudah valid dan aktif"
        />
        <StatsCard
          title="Ditolak"
          value={summary.rejected}
          icon={XCircle}
          iconClassName="bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
          description="Perlu diperbaiki"
        />
      </div>

      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full px-3 py-1">
                Completion {summary.completionRate}%
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {formatNumber(summary.employees)} pegawai
              </Badge>
              <Badge variant="warning" className="rounded-full px-3 py-1">
                {formatNumber(summary.expiringSoon)} kedaluwarsa 30 hari
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1 sm:w-fit">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors sm:gap-2 sm:px-3",
                      activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                    type="button"
                  >
                    <Icon className="h-4 w-4 shrink-0"/>
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
          <ChartCard title="Tren Upload Dokumen" description="Pergerakan upload enam bulan terakhir" icon={TrendingUp}
                     className="xl:col-span-2">
            <UploadAreaChart data={data.monthlyUploadTrend}/>
          </ChartCard>
          <ChartCard title="Status Verifikasi" description="Komposisi status dokumen aktif" icon={PieChartIcon}>
            <StatusDonutChart data={summary.statusSummary}/>
          </ChartCard>
          <ChartCard title="Upload Berdasarkan Jenis" description="Komposisi jenis dokumen per bulan" icon={Layers3}
                     className="xl:col-span-3">
            <GroupedDocumentBarChart data={data.documentUploadsByTypeLastSixMonths} keys={data.documentUploadTypeKeys}/>
          </ChartCard>
        </div>
      )}

      {activeTab === "employees" && (
        <div className="grid grid-cols-1 items-start gap-4">
          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
            <ChartCard title="Unit Kerja" description="Peta proporsi unit kerja terbanyak" icon={BarChart3}>
              <HorizontalBarChart data={data.employeeByWorkplace} color="#2563eb"/>
            </ChartCard>
            <ChartCard title="Jenis Kepegawaian" description="Sebaran kelompok pegawai utama" icon={PieChartIcon}>
              <SimpleDonutChart data={data.employeeByEmployeeGroup} centerLabel="Pegawai"/>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
            <ChartCard title="Jenis Kelamin" description="Komposisi profil pegawai" icon={PieChartIcon}>
              <GenderDonutChart data={data.employeeByGender}/>
            </ChartCard>
            <ChartCard title="Gender per Jenis Kepegawaian"
                       description="Perbandingan jenis kelamin pada setiap jenis kepegawaian" icon={Users}>
              <GenderGroupedBarChart data={data.employeeByGenderAndEmployeeGroup}/>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
            <ChartCard title="Gender per Status Kepegawaian"
                       description="Perbandingan jenis kelamin pada setiap status kepegawaian" icon={Users}>
              <GenderGroupedBarChart data={data.employeeByGenderAndEmploymentStatus}/>
            </ChartCard>
            <ChartCard title="Golongan Pegawai" description="Distribusi pegawai berdasarkan golongan ruang"
                       icon={Award}>
              <HorizontalBarChart data={data.employeeByRank} color="#8b5cf6"/>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
            <ChartCard title="Jabatan" description="Distribusi pegawai berdasarkan jabatan" icon={Briefcase}>
              <HorizontalBarChart data={data.employeeByPosition} color="#f59e0b"/>
            </ChartCard>
            <ChartCard title="Kelompok Profesi" description="Distribusi pegawai per kelompok profesi" icon={Heart}>
              <SimpleDonutChart data={data.employeeByProfessionGroup} centerLabel="Profesi"/>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
            <ChartCard title="Kelompok Usia" description="Distribusi usia pegawai aktif" icon={Calendar}>
              <AgeGroupBarChart data={data.employeeByAgeGroup}/>
            </ChartCard>
            <ChartCard title="Agama" description="Komposisi agama pegawai" icon={Heart}>
              <SimpleDonutChart data={data.employeeByReligion} centerLabel="Total"/>
            </ChartCard>
            <ChartCard title="Status Pernikahan" description="Status pernikahan pegawai" icon={Users}>
              <SimpleDonutChart data={data.employeeByMaritalStatus} centerLabel="Total"/>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
            <ChartCard title="Pendidikan Terakhir" description="Tingkat pendidikan pegawai" icon={GraduationCap}
                       className="xl:col-span-3">
              <SimplePieChart data={data.employeeByEducation}/>
            </ChartCard>
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="grid grid-cols-1 items-start gap-4">
          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
            <ChartCard title="Dokumen Wajib Belum Terpenuhi" description="Gap dokumen wajib dengan prioritas tertinggi"
                       icon={FileCheck2}>
              <MissingMandatoryChart data={data.missingMandatoryDocumentsTop}/>
            </ChartCard>
            <ChartCard title="Risiko Kedaluwarsa" description="Dokumen approved yang mendekati akhir masa berlaku"
                       icon={FileClock}>
              <ExpiryLineChart data={expiringChartData}/>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
            <ChartCard title="Kategori Arsip" description="Distribusi dokumen per kategori arsip" icon={Archive}>
              <SimpleDonutChart data={data.documentsByArchiveCategory} centerLabel="Dokumen"/>
            </ChartCard>
            <ChartCard title="Konteks Verifikasi" description="Ringkasan cepat status dokumen saat ini"
                       icon={ShieldCheck}>
              <StatusBreakdownPanel data={summary.statusSummary}/>
            </ChartCard>
          </div>
        </div>
      )}

      <div className="mt-4 text-right text-[10px] text-muted-foreground">
        Data diperbarui otomatis secara berkala. Terakhir diperbarui pada:{" "}
        <span className="font-mono">{new Date(data.generatedAt).toLocaleString("id-ID")}</span>
      </div>
    </div>
  );
}
