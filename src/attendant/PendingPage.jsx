import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import OutpassModal from "./OutpassModal";
import { apiFetch } from "../utils/api";

import {
  Header,
  Stats,
  Filters,
  PendingTable,
  Pagination,
  BulkToolbar,
  RemarkDialog,
  Toast,
} from "./outpass";

const PENDING_QUERY_KEY = ["outpasses", "pending"];

// ===========================
// Fetcher — normalizes the API's nested shape:
// { statusCode, data: { data: [...], pagination: {...} }, message, success }
// ===========================
async function fetchPendingOutpasses() {
  const result = await apiFetch(`/api/students/hostel-status`, {
    method: "POST",
    body: JSON.stringify({ outp_status: "Pending" }),
  });

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
      page: apiPagination?.page ?? 1,
      total: apiPagination?.total ?? items.length,
      totalPages: apiPagination?.totalPages ?? 1,
      hasNextPage: apiPagination?.hasNextPage ?? false,
      hasPrevPage: apiPagination?.hasPrevPage ?? false,
    },
  };
}

export default function PendingPage() {
  // ===========================
  // State
  // ===========================

  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Remark dialog (drives both single and bulk approve/reject)
  const [remarkDialog, setRemarkDialog] = useState({
    open: false,
    action: "",
    ids: [],
  });

  // Toast
  const [toast, setToast] = useState(null);

  // Select all checkbox
  const selectAllRef = useRef(null);

  // Pagination (server only returns one page today; kept for UI wiring)
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryClient = useQueryClient();

  // ===========================
  // Query — cache is persisted to localStorage (see queryClient.js).
  // On mount: cached data (if any) renders instantly, then this
  // refetches in the background and swaps in fresh data.
  // ===========================
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: PENDING_QUERY_KEY,
    queryFn: fetchPendingOutpasses,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Clear selection whenever the page changes
  useEffect(() => {
    setSelectedIds([]);
  }, [page]);

  // ===========================
  // View (fetch full outpass details) — one-off, not cached
  // ===========================

  async function handleView(outpass) {
    try {
      const result = await apiFetch(
        `/api/students/outpass/${outpass.id}`
      );

      setSelected(result.data);
    } catch (err) {
      console.error(err);

      setToast({
        type: "error",
        message:
          err.message ||
          "Failed to fetch outpass details",
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
        o.hostel?.toLowerCase().includes(q) ||
        o.room?.toLowerCase().includes(q) ||
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
  // Select All Checkbox
  // ===========================

  useEffect(() => {
    if (!selectAllRef.current) return;

    const all =
      processed.length > 0 &&
      selectedIds.length === processed.length;

    selectAllRef.current.indeterminate =
      selectedIds.length > 0 && !all;
  }, [processed, selectedIds]);

  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? processed.map((o) => o.id) : []);
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // ===========================
  // Single / Bulk Approve / Reject (open remark dialog)
  // ===========================

  function approve(id) {
    setRemarkDialog({ open: true, action: "approve", ids: [id] });
  }

  function reject(id) {
    setRemarkDialog({ open: true, action: "reject", ids: [id] });
  }

  function bulkApprove() {
    if (selectedIds.length === 0) return;
    setRemarkDialog({ open: true, action: "approve", ids: selectedIds });
  }

  function bulkReject() {
    if (selectedIds.length === 0) return;
    setRemarkDialog({ open: true, action: "reject", ids: selectedIds });
  }

  // ===========================
  // Remark Dialog Submit — mutation
  // Handles both single (ids.length === 1) and bulk (ids.length > 1).
  // On success, invalidates the pending-outpasses query so it refetches
  // and the persisted cache gets updated with fresh data.
  // ===========================

  const remarkMutation = useMutation({
    mutationFn: async ({ action, ids, remark }) => {
      if (ids.length === 1) {
        return apiFetch(`/api/outpasses/${action}/${ids[0]}`, {
          method: "PATCH",
          body: JSON.stringify({ remark }),
        });
      }
      return apiFetch("/api/outpasses/bulk-action", {
        method: "PATCH",
        body: JSON.stringify({ ids, action, remark }),
      });
    },
    onSuccess: (_result, variables) => {
      const { action, ids } = variables;

      setToast({
        type: "success",
        message: `${ids.length} outpass${
          ids.length > 1 ? "es" : ""
        } ${action === "approve" ? "approved" : "rejected"} successfully.`,
      });

      setRemarkDialog({ open: false, action: "", ids: [] });
      setSelectedIds([]);

      queryClient.invalidateQueries({ queryKey: PENDING_QUERY_KEY });
    },
    onError: (err) => {
      setToast({
        type: "error",
        message: err.message || "Action failed.",
      });
    },
  });

  function submitRemark(remark) {
    const { action, ids } = remarkDialog;
    if (ids.length === 0) return;

    if (action === "reject" && !remark?.trim()) {
      setToast({
        type: "error",
        message: "A remark is required to reject an outpass.",
      });
      return;
    }

    remarkMutation.mutate({ action, ids, remark });
  }

  const allSelected =
    processed.length > 0 && processed.length === selectedIds.length;

  // ===========================
  // Loading (only shown when there's no cached data to paint yet —
  // if a persisted cache exists, isLoading is false and stale data
  // renders immediately while it refetches in the background)
  // ===========================

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-lg text-gray-500">
          Loading Pending Outpasses...
        </div>
      </div>
    );
  }

  // ===========================
  // Error
  // ===========================

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {error?.message || "Unable to load pending outpasses."}
        </div>
      </div>
    );
  }

  // ===========================
  // Render
  // ===========================

  return (
    <div className="p-4 sm:p-6 space-y-5 relative">
      <Header
        title="Pending Outpasses"
        subtitle="Review, approve or reject hostel outpass requests"
        total={pagination.total}
        buttonLabel="Pending"
        onRefresh={() => refetch()}
      />

      <Stats
        total={pagination.total}
        page={pagination.page}
        totalPages={pagination.totalPages}
        showing={processed.length}
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

      <BulkToolbar
        selectedCount={selectedIds.length}
        loading={remarkMutation.isPending}
        onApprove={bulkApprove}
        onReject={bulkReject}
        onClear={() => setSelectedIds([])}
      />

      <PendingTable
        data={processed}
        selectedIds={selectedIds}
        selectAllRef={selectAllRef}
        allSelected={allSelected}
        toggleSelectAll={toggleSelectAll}
        toggleRow={toggleRow}
        onView={handleView}
        onApprove={approve}
        onReject={reject}
      />

      <Pagination
        page={page}
        setPage={setPage}
        pagination={pagination}
        limit={limit}
        label="pending requests"
      />

      {selected && (
        <OutpassModal
          outpass={selected?.outpass}
          remarks={selected?.remarks}
          onClose={() => setSelected(null)}
        />
      )}

      <RemarkDialog
        open={remarkDialog.open}
        action={remarkDialog.action}
        count={remarkDialog.ids.length}
        loading={remarkMutation.isPending}
        requireRemark={remarkDialog.action === "reject"}
        onCancel={() =>
          setRemarkDialog({ open: false, action: "", ids: [] })
        }
        onSubmit={submitRemark}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}