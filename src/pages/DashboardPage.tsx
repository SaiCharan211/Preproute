import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import type { Test } from "../types";

export default function DashboardPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTests = async () => {
    try {
      const res = await api.get("/tests");
      if (res.data.status==='success') setTests(res.data.data);
    } catch {
      toast.error("Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (id: string) => {
    if (!confirm("Delete this test?")) return;
    try {
      await api.delete(`/tests/${id}`);
      toast.success("Test deleted");
      fetchTests();
    } catch {
      toast.error("Failed to delete");
    }
  };

  useEffect(() => { fetchTests(); }, []);

  const statusColor = (status: string | null) => {
    if (status === "live") return "bg-green-100 text-green-700";
    if (status === "draft") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">All Tests</h1>
        <button
          onClick={() => navigate("/create-test")}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Create New Test
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading tests...</div>
      ) : tests.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No tests yet. Create your first test!
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Name", "Subject", "Status", "Questions", "Created", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{test.name}</td>
                  <td className="px-4 py-3 text-gray-600">{test.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(test.status)}`}>
                      {test.status || "draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{test.total_questions}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(test.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/preview/${test.id}`)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Preview">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => navigate(`/edit-test/${test.id}`)} className="p-1.5 rounded hover:bg-blue-50 text-blue-500" title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deleteTest(test.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}