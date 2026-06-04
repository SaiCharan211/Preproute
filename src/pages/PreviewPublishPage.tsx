import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import type{ Test, Question } from "../types";

export default function PreviewPublishPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");
  const [liveUntil, setLiveUntil] = useState("always");

  useEffect(() => {
    if (!testId) return;
    api.get(`/tests/${testId}`).then(async (res) => {
      if (res.data.status==='success') {
        const t = res.data.data;
        setTest(t);
        if (t.questions?.length) {
          const qRes = await api.post("/questions/fetchBulk", {
            question_ids: t.questions,
          });
          if (qRes.data.status==='success') setQuestions(qRes.data.data);
        }
      }
    });
  }, [testId]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await api.put(`/tests/${testId}`, { status: "live" });
      if (res.data.status==='success') {
        toast.success("🎉 Test published successfully!");
        navigate("/dashboard");
      }
    } catch {
      toast.error("Failed to publish test");
    } finally {
      setPublishing(false);
    }
  };

  if (!test) return <div className="text-center py-20 text-gray-400">Loading preview...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Test Creation / Create Test / <span className="text-blue-500">Chapter Wise</span>
        </div>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
        >
          {publishing ? "Publishing..." : "Publish"}
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-gray-700">Test created</span>
        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
          ✓ All {test.total_questions} Questions done
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-gray-800 text-white rounded-full text-xs font-medium">
            Chapter Wise
          </span>
          <button
            onClick={() => navigate(`/edit-test/${testId}`)}
            className="text-blue-400 hover:text-blue-600"
          >
            ✏
          </button>
        </div>

        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
          📚 {test.name}
          <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium capitalize">
            {test.difficulty}
          </span>
        </h2>

        <div className="space-y-1.5 text-sm text-gray-600 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-gray-400 w-20">Subject</span>
            <span>: {test.subject}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-400 w-20">Topic</span>
            <span>: {Array.isArray(test.topics)
              ? test.topics.map((t, i) => (
                  <span key={i} className="inline-block bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs mr-1">{t}</span>
                ))
              : test.topics}
            </span>
          </div>
        </div>

        <div className="flex gap-6 text-sm text-gray-500 border-t border-gray-100 pt-3">
          <span>⏱ {test.total_time} Min</span>
          <span>❓ {test.total_questions} Q's</span>
          <span>🏆 {test.total_marks} Marks</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex gap-6 border-b border-gray-100 pb-3 mb-4">
          {["now", "schedule"].map((mode) => (
            <button
              key={mode}
              onClick={() => setPublishMode(mode as "now" | "schedule")}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                publishMode === mode
                  ? "border-blue-500 text-gray-800"
                  : "border-transparent text-gray-400"
              }`}
            >
              {mode === "now" ? "Publish Now" : "Schedule Publish"}
            </button>
          ))}
        </div>

        {publishMode === "schedule" && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Select Date and Time</p>
            <div className="grid grid-cols-2 gap-4">
              <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="time" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-gray-800 mb-1">Live Until</p>
          <p className="text-xs text-gray-400 mb-3">Choose how long this test should remain available on the platform.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "always", label: "Always Available" },
              { value: "3weeks", label: "3 Weeks" },
              { value: "1week", label: "1 Week" },
              { value: "1month", label: "1 Month" },
              { value: "2weeks", label: "2 Weeks" },
              { value: "custom", label: "Custom Duration" },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="radio"
                  name="liveUntil"
                  value={value}
                  checked={liveUntil === value}
                  onChange={() => setLiveUntil(value)}
                  className="accent-blue-500"
                />
                {label}
              </label>
            ))}
          </div>

          {liveUntil === "custom" && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <input type="date" placeholder="Select End Date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="time" placeholder="Select End Time" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800">All Questions ({questions.length})</h3>
          <button
            onClick={() => navigate(`/add-questions/${testId}`)}
            className="text-blue-500 text-sm hover:underline"
          >
            ✏ Edit Questions
          </button>
        </div>

        {questions.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            No questions added yet.{" "}
            <button onClick={() => navigate(`/add-questions/${testId}`)} className="text-blue-500 underline">
              Add Questions
            </button>
          </p>
        ) : (
          <div className="space-y-6">
            {questions.map((q, i) => (
              <div key={q.id || i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <p className="font-medium text-gray-800 mb-3">
                  Q{i + 1}. {q.question}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(["option1", "option2", "option3", "option4"] as const).map((opt) => (
                    <div
                      key={opt}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                        q.correct_option === opt
                          ? "bg-green-50 border-green-300 text-green-700 font-medium"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {String.fromCharCode(65 + ["option1","option2","option3","option4"].indexOf(opt))}
                      </span>
                      {(q as any)[opt]}
                      {q.correct_option === opt && <span className="ml-auto text-xs">✓</span>}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="mt-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-5 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="px-8 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
        >
          {publishing ? "Publishing..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}