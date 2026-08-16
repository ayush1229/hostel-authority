import React, { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import OutpassModal from "./OutpassModal";
import { apiFetch } from "../utils/api";

import {
  Header,
  Stats,
  Filters,
  HistoryTable,
  Pagination,
  Toast,
} from "./outpass";

const LIMIT = 10;

// ===========================
// Fetcher — normalizes the API's nested shape:
// { statusCode, data: { data: [...], pagination: {...} }, message, success }
// ===========================
async function fetchApprovedOutpasses(page) {
  const result = await apiFetch(
    `/api/students/hostel-status?page=${page}&limit=${LIMIT}`,
    {
      method: "POST",
      body: JSON.stringify({ outp_status: "Approved" }),
    }
  );

  const items = Array.isArray(result)
    ? result
    : Array.isArray(result?.data)
    ? result.data
    : Array.isArray(result?.data?.data)
    ? result.data.data
    : [];

  const apiPagination = result?.data?.pagination;

  return {
    items,
    pagination: {
      page: apiPagination?.page ?? page,
      total: apiPagination?.total ?? items.length,
      totalPages: apiPagination?.totalPages ?? 1,
      hasNextPage: apiPagination?.hasNextPage ?? false,
      hasPrevPage: apiPagination?.hasPrevPage ?? false,
    },
  };
}

export default function ApprovedPage() {
  // ===========================
  // State
  // ===========================

  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  const [toast, setToast] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);

  // ===========================
  // Query — cache is persisted to localStorage (see queryClient.js/ts).
  // `page` is part of the key, so each page is cached separately and
  // navigating back to a page you've already seen paints instantly.
  // ===========================
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["outpasses", "approved", page],
    queryFn: () => fetchApprovedOutpasses(page),
    placeholderData: keepPreviousData, // avoids a loading flash when flipping pages
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // ===========================
  // View (fetch full outpass details) — one-off, not cached
  // ===========================

  async function handleView(outpass) {
    try {
      const result = await apiFetch(
        `/api/students/outpass/${outpass.outpass_id}`
      );

      setSelected(result.data);
    } catch (err) {
      console.error(err);

      setToast({
        type: "error",
        message: err?.message || "Failed to fetch outpass details",
      });
    }
  }

  // ===========================
  // Search + Filter + Sort
  // ===========================

  const processed = useMemo(() => {
    let arr = Array.isArray(items) ? [...items] : [];

    const q = search.toLowerCase();

    arr = arr.filter(
      (o) =>
        o.name?.toLowerCase().includes(q) ||
        o.roll_no?.toLowerCase().includes(q) ||
        o.department?.toLowerCase().includes(q) ||
        o.room?.toLowerCase().includes(q) ||
        o.hostel?.toLowerCase().includes(q) ||
        o.place_of_visit?.toLowerCase().includes(q) ||
        o.purpose?.toLowerCase().includes(q)
    );

    if (filter !== "All") {
      arr = arr.filter((o) => o.outpass_type === filter);
    }

    arr.sort((a, b) =>
      sortBy === "latest"
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.departure_datetime) -
          new Date(b.departure_datetime)
    );

    return arr;
  }, [items, search, filter, sortBy]);

  // ===========================
  // Loading (only on first load — page flips use keepPreviousData
  // so stale data stays visible instead of flashing a spinner)
  // ===========================

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading approved outpasses...
      </div>
    );
  }

  // ===========================
  // Error
  // ===========================

  if (isError) {
    return (
      <div className="p-10 text-red-600">
        {error?.message || "Failed to fetch approved outpasses"}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Header
        title="Approved Outpasses"
        subtitle="Successfully approved requests"
        total={pagination.total}
        buttonLabel="Approved"
        buttonColor="bg-green-600"
        onRefresh={() => refetch()}
      />

      <Stats
        total={pagination.total}
        page={pagination.page}
        totalPages={pagination.totalPages}
        showing={processed.length}
        color="text-green-700"
      />

      <Filters
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showing={processed.length}
        total={pagination.total}
      />

      <HistoryTable
        data={processed}
        onView={handleView}
        statusColor="bg-green-100 text-green-700"
        emptyMessage="No approved outpasses found"
      />

      <Pagination
        page={page}
        setPage={setPage}
        pagination={pagination}
        limit={LIMIT}
        label="approved requests"
        color="bg-green-600"
      />

      {selected && (
        <OutpassModal
          outpass={selected?.outpass}
          remarks={selected?.remarks}
          onClose={() => setSelected(null)}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}