import React from 'react';

/**
 * Base shimmering pulse animation component for sleek skeleton loaders
 */
export function SkeletonBlock({
  className = '',
  rounded = 'rounded-xl',
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-200/70 dark:bg-white/[0.06] ${rounded} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/[0.08] to-transparent" />
    </div>
  );
}

/**
 * Full page skeleton loader for the main Dashboard
 */
export function DashboardSkeletonLoader() {
  return (
    <div 
      id="dashboard-skeleton-loader"
      aria-busy="true" 
      aria-label="Loading Dashboard Data"
      className="relative min-h-screen bg-background text-primary p-4 md:p-8 animate-pulse duration-700"
    >
      <div className="max-w-[1440px] mx-auto pb-8 w-full space-y-8">
        {/* Top Header & Level Bar Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-border/40">
          <div className="space-y-3">
            <SkeletonBlock className="h-8 w-64 md:w-80" rounded="rounded-xl" />
            <SkeletonBlock className="h-4 w-48 md:w-60" rounded="rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-28" rounded="rounded-full" />
            <SkeletonBlock className="h-10 w-32" rounded="rounded-full" />
            <SkeletonBlock className="h-10 w-10" rounded="rounded-full" />
          </div>
        </div>

        {/* Level & Hashrate Progress Bar Skeleton */}
        <div className="bg-card/80 border border-border/50 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <SkeletonBlock className="h-4 w-36" rounded="rounded-md" />
            <SkeletonBlock className="h-4 w-20" rounded="rounded-md" />
          </div>
          <SkeletonBlock className="h-3 w-full" rounded="rounded-full" />
        </div>

        {/* 4 Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card/90 border border-border/60 rounded-3xl p-6 space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <SkeletonBlock className="h-3 w-24" rounded="rounded-md" />
                <SkeletonBlock className="h-9 w-9" rounded="rounded-xl" />
              </div>
              <SkeletonBlock className="h-8 w-36" rounded="rounded-lg" />
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-3 w-16" rounded="rounded-md" />
                <SkeletonBlock className="h-3 w-20" rounded="rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Chart + Side Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chart Card Skeleton */}
          <div className="lg:col-span-8 bg-card/90 border border-border/60 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <SkeletonBlock className="h-5 w-44" rounded="rounded-md" />
                <SkeletonBlock className="h-3 w-64" rounded="rounded-md" />
              </div>
              <div className="flex gap-2">
                <SkeletonBlock className="h-8 w-16" rounded="rounded-lg" />
                <SkeletonBlock className="h-8 w-16" rounded="rounded-lg" />
                <SkeletonBlock className="h-8 w-16" rounded="rounded-lg" />
              </div>
            </div>
            {/* Chart Canvas Area */}
            <SkeletonBlock className="h-[280px] md:h-[340px] w-full" rounded="rounded-2xl" />
          </div>

          {/* Side Wallet & Quick Actions Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card/90 border border-border/60 rounded-3xl p-6 space-y-4 shadow-sm">
              <SkeletonBlock className="h-4 w-32" rounded="rounded-md" />
              <SkeletonBlock className="h-8 w-44" rounded="rounded-lg" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <SkeletonBlock className="h-11 w-full" rounded="rounded-xl" />
                <SkeletonBlock className="h-11 w-full" rounded="rounded-xl" />
              </div>
            </div>

            <div className="bg-card/90 border border-border/60 rounded-3xl p-6 space-y-4 shadow-sm">
              <SkeletonBlock className="h-4 w-40" rounded="rounded-md" />
              <div className="space-y-3">
                {[1, 2, 3].map((k) => (
                  <div key={k} className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-3">
                      <SkeletonBlock className="h-8 w-8" rounded="rounded-lg" />
                      <div className="space-y-1.5">
                        <SkeletonBlock className="h-3 w-16" rounded="rounded-md" />
                        <SkeletonBlock className="h-2.5 w-10" rounded="rounded-md" />
                      </div>
                    </div>
                    <SkeletonBlock className="h-4 w-14" rounded="rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Operations & Transactions Table Skeleton */}
        <div className="bg-card/90 border border-border/60 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <SkeletonBlock className="h-5 w-44" rounded="rounded-md" />
            <SkeletonBlock className="h-4 w-20" rounded="rounded-md" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-surface/50 border border-border/30"
              >
                <div className="flex items-center gap-3.5">
                  <SkeletonBlock className="h-10 w-10 shrink-0" rounded="rounded-xl" />
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-3.5 w-32 md:w-44" rounded="rounded-md" />
                    <SkeletonBlock className="h-2.5 w-24" rounded="rounded-md" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <SkeletonBlock className="h-4 w-20 md:w-28" rounded="rounded-md" />
                  <SkeletonBlock className="h-3 w-12" rounded="rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for the Transactions page & history module
 */
export function TransactionsSkeletonLoader() {
  return (
    <div
      id="transactions-skeleton-loader"
      aria-busy="true"
      aria-label="Loading Transactions History"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 space-y-8 animate-pulse duration-700"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-60" rounded="rounded-xl" />
          <SkeletonBlock className="h-4 w-80" rounded="rounded-md" />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <SkeletonBlock className="h-10 w-full md:w-64" rounded="rounded-full" />
          <SkeletonBlock className="h-10 w-10 shrink-0" rounded="rounded-full" />
        </div>
      </div>

      {/* Main Table Card Skeleton */}
      <div className="bg-card rounded-3xl border border-border/50 p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex justify-between items-center pb-4 border-b border-border/50">
          <SkeletonBlock className="h-4 w-24" rounded="rounded-md" />
          <SkeletonBlock className="h-4 w-24" rounded="rounded-md" />
          <SkeletonBlock className="h-4 w-24 hidden sm:block" rounded="rounded-md" />
          <SkeletonBlock className="h-4 w-24 hidden md:block" rounded="rounded-md" />
          <SkeletonBlock className="h-4 w-20" rounded="rounded-md" />
        </div>

        {/* Rows */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl bg-surface/40 border border-border/30"
            >
              <div className="flex items-center gap-3.5">
                <SkeletonBlock className="h-10 w-10 shrink-0" rounded="rounded-xl" />
                <div className="space-y-2">
                  <SkeletonBlock className="h-3.5 w-32 md:w-48" rounded="rounded-md" />
                  <SkeletonBlock className="h-2.5 w-20" rounded="rounded-md" />
                </div>
              </div>
              <SkeletonBlock className="h-4 w-24 hidden sm:block" rounded="rounded-md" />
              <SkeletonBlock className="h-4 w-28 hidden md:block" rounded="rounded-md" />
              <div className="flex flex-col items-end gap-1.5">
                <SkeletonBlock className="h-4 w-20" rounded="rounded-md" />
                <SkeletonBlock className="h-3 w-14" rounded="rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for the Assets and Wealth allocation page
 */
export function AssetsSkeletonLoader() {
  return (
    <div
      id="assets-skeleton-loader"
      aria-busy="true"
      aria-label="Loading Assets and Portfolio Data"
      className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen space-y-8 animate-pulse duration-700"
    >
      {/* Header Skeleton */}
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-72" rounded="rounded-xl" />
        <SkeletonBlock className="h-4 w-96 max-w-full" rounded="rounded-md" />
      </div>

      {/* 4 Asset Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-3xl p-6 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-4 w-28" rounded="rounded-md" />
              <SkeletonBlock className="h-9 w-9" rounded="rounded-xl" />
            </div>
            <SkeletonBlock className="h-7 w-36" rounded="rounded-lg" />
            <SkeletonBlock className="h-3 w-24" rounded="rounded-md" />
          </div>
        ))}
      </div>

      {/* Dual Charts: Allocation Pie + Bar Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pie Chart Card Skeleton */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-3xl p-6 space-y-6 shadow-sm flex flex-col items-center justify-center">
          <div className="w-full flex justify-between items-center">
            <SkeletonBlock className="h-5 w-36" rounded="rounded-md" />
            <SkeletonBlock className="h-4 w-16" rounded="rounded-md" />
          </div>
          <div className="w-52 h-52 rounded-full border-8 border-slate-200/60 dark:border-white/10 flex items-center justify-center my-4">
            <SkeletonBlock className="h-24 w-24" rounded="rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3 w-full pt-2">
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className="flex items-center gap-2">
                <SkeletonBlock className="h-3 w-3" rounded="rounded-full" />
                <SkeletonBlock className="h-3 w-20" rounded="rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart Card Skeleton */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <SkeletonBlock className="h-5 w-44" rounded="rounded-md" />
              <SkeletonBlock className="h-3 w-32" rounded="rounded-md" />
            </div>
            <SkeletonBlock className="h-8 w-24" rounded="rounded-lg" />
          </div>
          <SkeletonBlock className="h-[280px] w-full" rounded="rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
