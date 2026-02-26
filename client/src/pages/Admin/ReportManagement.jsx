import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import useApi from "../../hooks/useApi";

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const { showToast } = useToast();
  const { execute } = useApi();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await execute("/api/admin/reports");
      if (data?.success) {
        setReports(data.reports);
      } else {
        setError(data?.message || data?.msg || "Failed to load reports");
      }
    } catch {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const data = await execute(`/api/admin/reports/${id}`, {
        method: "PATCH",
        body: { status },
      });
      if (data?.success) {
        setReports((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, status: data.report.status } : r,
          ),
        );
        showToast(`Report marked as ${status}`, "success");
      } else {
        showToast(
          data?.message || data?.msg || "Failed to update report status",
          "error",
        );
        fetchReports();
      }
    } catch {
      showToast("Failed to update report status", "error");
      fetchReports();
    }
  };

  const filteredReports = reports.filter((r) =>
    statusFilter === "all" ? true : r.status === statusFilter,
  );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] text-xs">
          Scanning Platform Flags...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="max-w-2xl mx-auto p-12 mt-12 bg-white dark:bg-[#1a1a1a] border border-red-100 dark:border-red-900/20 rounded-[2.5rem] text-center shadow-xl">
        <div className="flex justify-center mb-6 text-amber-500">
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
          Signal Interrupted
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
          {error}
        </p>
        <button
          onClick={fetchReports}
          className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-600/20 active:scale-95"
        >
          Re-establish Connection
        </button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-64px)] space-y-10">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-gray-100 dark:border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">
              Integrity Shield
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-2">
            Safety Console
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Review and resolve priority flags to maintain ecosystem health.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Active Signal Count
            </span>
            <span className="text-2xl font-black text-amber-500 tracking-tighter tabular-nums">
              {reports.length.toString().padStart(3, "0")}
            </span>
          </div>
          <Link
            to="/admin"
            className="px-6 py-4 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 font-bold rounded-2xl text-sm transition-all hover:border-amber-500 hover:text-amber-500 shadow-sm"
          >
            ← Command Center
          </Link>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 overflow-x-auto pb-2 scrollbar-hide py-2">
        <div className="flex bg-gray-100/50 dark:bg-black/20 p-1.5 rounded-[1.25rem] border border-gray-200/50 dark:border-white/5 min-w-max backdrop-blur-xl">
          {[
            { id: "pending", label: "Pending", color: "amber" },
            { id: "resolved", label: "Resolved", color: "emerald" },
            { id: "dismissed", label: "Dismissed", color: "gray" },
            { id: "all", label: "All Logs", color: "blue" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === tab.id
                  ? `bg-white dark:bg-[#1a1a1a] text-${tab.color}-500 shadow-xl shadow-black/5`
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-[#2a2a2a] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-black/20 text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100 dark:border-white/5">
                <th className="px-8 py-5">Source Agent</th>
                <th className="px-8 py-5 w-52 text-center">Protocol Node</th>
                <th className="px-8 py-5 min-w-[300px]">Data & Intelligence</th>
                <th className="px-8 py-5 w-40 text-center">Status</th>
                <th className="px-8 py-5 w-40 text-center">Timestamp</th>
                <th className="px-8 py-5 text-right pr-12">Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-6 grayscale opacity-40">
                      <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          Area is Secure
                        </p>
                        <p className="text-sm font-medium text-gray-500">
                          No priority flags detected in this sector.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report._id}
                    className="transition-all hover:bg-gray-50 dark:hover:bg-white/[0.02] group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-xs border border-amber-500/20 shadow-sm transition-transform group-hover:scale-110">
                          {report.reporterId?.name?.charAt(0) || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 dark:text-white truncate text-sm leading-tight">
                            {report.reporterId?.name || "Terminated Node"}
                          </p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                            {report.reporterId?.email || "Encrypted ID"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className={`inline-flex px-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            report.targetType === "Listing"
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          }`}
                        >
                          {report.targetType}
                        </span>
                        {report.target ? (
                          <Link
                            to={
                              report.targetType === "Listing"
                                ? `/listings/${report.targetId}`
                                : `/profile/${report.targetId}`
                            }
                            className="text-xs font-bold text-gray-900 dark:text-gray-200 hover:text-amber-500 transition-colors inline-flex items-center gap-1.5 truncate max-w-[140px]"
                          >
                            {report.targetType === "Listing"
                              ? report.target.title
                              : report.target.name}
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              className="opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </Link>
                        ) : (
                          <span className="text-xs italic text-gray-400 uppercase font-black tracking-widest opacity-50">
                            Null Link
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="bg-gray-100/50 dark:bg-black/20 border border-gray-200/50 dark:border-white/5 rounded-2xl p-4 group-hover:border-amber-500/20 transition-colors">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                          &ldquo;{report.reason}&rdquo;
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          report.status === "pending"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                            : report.status === "resolved"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                              : "bg-gray-100 dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/5"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            report.status === "pending"
                              ? "bg-amber-500 animate-pulse"
                              : report.status === "resolved"
                                ? "bg-emerald-500"
                                : "bg-gray-500"
                          }`}
                        />
                        {report.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-xs font-black text-gray-500 dark:text-gray-400 whitespace-nowrap tracking-tighter">
                        {new Date(report.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                        <br />
                        <span className="text-[10px] opacity-50 uppercase">
                          {new Date(report.createdAt).getFullYear()}
                        </span>
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right pr-12">
                      <div className="flex items-center justify-end gap-2">
                        {report.status === "pending" ? (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(report._id, "resolved")
                              }
                              className="px-5 py-2.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(report._id, "dismissed")
                              }
                              className="px-5 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                            >
                              Dismiss
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest italic pr-4">
                            Log Sealed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportManagement;
