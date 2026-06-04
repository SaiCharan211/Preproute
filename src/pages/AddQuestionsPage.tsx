import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import type { Question, Test, Topic, SubTopic } from "../types";

const EMPTY_Q = {
    type: "mcq",
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correct_option: "option1",
    explanation: "",
    difficulty: "easy",
    topic_id: "",
    sub_topic_id: "",
};

export default function AddQuestionsPage() {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();

    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState([{ ...EMPTY_Q }]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
    const [saving, setSaving] = useState(false);


    useEffect(() => {
        if (!testId) return;
        api.get(`/tests/${testId}`).then(async (res) => {
            if (res.data.status === 'success') {
                const t = res.data.data;
                setTest(t);

                try {
                    const subjectsRes = await api.get('/subjects');
                    const allSubjects = subjectsRes.data.data ?? [];
                    const matchedSubject = allSubjects.find((s: any) => s.name === t.subject);
                    if (!matchedSubject) {
                        console.warn("Subject not found for test:", t.subject);
                    } else {
                        const topicsRes = await api.get(`/topics/subject/${matchedSubject.id}`);
                        const allTopics = topicsRes.data.data ?? [];
                        setTopics(allTopics);

                        const topicUUIDs = allTopics
                            .filter((tp: any) => t.topics?.includes(tp.name))
                            .map((tp: any) => tp.id);

                        if (topicUUIDs.length > 0) {
                            const subTopicsRes = await api.post('/sub-topics/multi-topics', {
                                topicIds: topicUUIDs,
                            });
                            setSubTopics(subTopicsRes.data.data ?? []);
                        }
                    }

                    if (t.questions && t.questions.length > 0) {
                        const qRes = await api.post("/questions/fetchBulk", {
                            question_ids: t.questions,
                        });
                        if (qRes.data.status === 'success' && qRes.data.data.length > 0) {
                            setQuestions(qRes.data.data);
                            setCurrentIdx(0); 
                        }
                    }

                } catch (e) {
                    console.error('Failed to load topics/subtopics or questions:', e);
                    toast.error("Failed to load test details for questions.");
                }
            }
        });
    }, [testId])

    const current = questions[currentIdx];

    const update = (field: string, value: string) => {
        setQuestions((prev) => {
            const updated = [...prev];
            updated[currentIdx] = { ...updated[currentIdx], [field]: value };
            return updated;
        });
    };

    const addQuestion = () => {
        setQuestions((prev) => [...prev, { ...EMPTY_Q }]);
        setCurrentIdx(questions.length);
    };

    const deleteQuestion = (idx: number) => {
        if (questions.length === 1) {
            toast.error("At least 1 question is required");
            return;
        }
        setQuestions((prev) => prev.filter((_, i) => i !== idx));
        setCurrentIdx(Math.max(0, currentIdx - 1));
    };

    const handleSave = async () => {
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question || !q.option1 || !q.option2 || !q.option3 || !q.option4) {
                toast.error(`Question ${i + 1} is incomplete — fill all 4 options`);
                setCurrentIdx(i);
                return;
            }
        }

        setSaving(true);
        try {
            const payload = questions.map((q) => {
                const question: any = {
                    type: q.type,
                    question: q.question,
                    option1: q.option1,
                    option2: q.option2,
                    option3: q.option3,
                    option4: q.option4,
                    correct_option: q.correct_option,
                    test_id: testId!,
                    subject: test!.subject
                };

                if (q.explanation?.trim()) question.explanation = q.explanation;
                if (q.difficulty) question.difficulty = q.difficulty;

                return question;
            });

            const res = await api.post("/questions/bulk", { questions: payload });

            if (res.data.status === "success") {
                const questionIds = res.data.data.map((q: any) => q.id);
                await api.put(`/tests/${testId}`, {
                    questions: questionIds,
                    total_questions: questionIds.length,
                    total_marks: test ? test.correct_marks * questionIds.length : 0,
                });
                toast.success("Questions saved!");
                navigate(`/preview/${testId}`);
            }
        } catch (err: any) {
            if (err.response?.data?.errors) {
                console.log("validation errors:", err.response.data.errors);
            }
            toast.error(err.response?.data?.message || "Failed to save questions");
        } finally {
            setSaving(false);
        }
    };

    if (!test) return <div className="text-center py-20 text-gray-400">Loading...</div>;

    const isComplete = (q: typeof EMPTY_Q) =>
        q.question && q.option1 && q.option2 && q.option3 && q.option4;

    return (
        <div className="flex gap-6 h-full">
            <div className="w-52 flex-shrink-0">
                <p className="text-sm font-medium text-gray-700 mb-1">Question creation</p>
                <p className="text-xs text-gray-400 mb-3">Total Questions: {questions.length}</p>
                <div className="space-y-1.5">
                    {questions.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIdx(i)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition-colors ${i === currentIdx
                                ? "bg-teal-50 border-teal-400 text-teal-700 font-medium"
                                : isComplete(q)
                                    ? "bg-teal-50 border-teal-200 text-teal-600"
                                    : "bg-gray-50 border-gray-200 text-gray-500"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {isComplete(q) && (
                                    <span className="w-4 h-4 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center">✓</span>
                                )}
                                <span>Question {i + 1}</span>
                            </div>
                            {questions.length > 1 && (
                                <span
                                    onClick={(e) => { e.stopPropagation(); deleteQuestion(i); }}
                                    className="text-red-300 hover:text-red-500 text-xs ml-1 cursor-pointer"
                                >×</span>
                            )}
                        </button>
                    ))}
                </div>
                <button
                    onClick={addQuestion}
                    className="w-full mt-3 px-3 py-2 rounded-lg border border-dashed border-blue-300 text-blue-500 text-sm hover:bg-blue-50"
                >
                    + Add Question
                </button>
            </div>

            <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 overflow-y-auto">
                <div className="mb-4 bg-gray-50 rounded-lg p-3 text-sm flex items-center justify-between">
                    <div>
                        <span className="font-semibold text-gray-800">{test.name}</span>
                        <span className="text-gray-400 ml-3">Subject: {test.subject}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                        <span>⏱ {test.total_time} Min</span>
                        <span>❓ {test.total_questions} Q's</span>
                        <span>🏆 {test.total_marks} Marks</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-medium text-gray-800 text-base">
                        Question {currentIdx + 1} / {questions.length}
                    </h2>
                    <button
                        onClick={() => deleteQuestion(currentIdx)}
                        className="text-red-400 text-sm hover:text-red-600 flex items-center gap-1"
                    >
                        🗑 Delete All Edits
                    </button>
                </div>

                <div className="mb-5">
                    <textarea
                        value={current.question}
                        onChange={(e) => update("question", e.target.value)}
                        placeholder="Type here"
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="mb-5">
                    <p className="text-sm font-medium text-gray-700 mb-2">Type the options below</p>
                    <div className="space-y-2">
                        {(["option1", "option2", "option3", "option4"] as const).map((opt, i) => (
                            <div key={opt} className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="correct"
                                    value={opt}
                                    checked={current.correct_option === opt}
                                    onChange={() => update("correct_option", opt)}
                                    className="accent-blue-500 w-4 h-4 flex-shrink-0"
                                />
                                <input
                                    value={(current as any)[opt]}
                                    onChange={(e) => update(opt, e.target.value)}
                                    placeholder={`Type Option here`}
                                    className="flex-1 border-b border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-transparent"
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        🔵 Select the radio button next to the correct answer
                    </p>
                </div>

                <div className="mb-5">
                    <p className="text-sm font-medium text-gray-700 mb-1">Add Solution (optional)</p>
                    <textarea
                        value={current.explanation}
                        onChange={(e) => update("explanation", e.target.value)}
                        placeholder="Type here"
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Question settings</p>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Level of Difficulty</label>
                            <select
                                value={current.difficulty}
                                onChange={(e) => update("difficulty", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Topic</label>
                            <select
                                value={current.topic_id}
                                onChange={(e) => update("topic_id", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm"
                            >
                                <option value="">Select from Drop-down</option>
                                {topics.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Sub-topic</label>
                            <select
                                value={current.sub_topic_id}
                                onChange={(e) => update("sub_topic_id", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm"
                            >
                                <option value="">Select from Drop-down</option>
                                {subTopics.map((st) => (
                                    <option key={st.id} value={st.id}>{st.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-4 py-2 rounded-lg bg-red-100 text-red-500 text-sm font-medium hover:bg-red-200"
                    >
                        Exit Test Creation
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                            disabled={currentIdx === 0}
                            className="px-3 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-30 hover:bg-gray-50"
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
                            disabled={currentIdx === questions.length - 1}
                            className="px-3 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-30 hover:bg-gray-50"
                        >
                            Next →
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}