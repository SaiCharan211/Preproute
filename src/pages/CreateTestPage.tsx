import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import type { Subject, Topic, SubTopic } from "../types";

const schema = z.object({
    name: z.string().min(1, "Test name is required"),
    type: z.string().min(1, "Test type is required"),
    subject: z.string().min(1, "Subject is required"),
    topics: z.array(z.string()).min(1, "At least one topic required"),
    sub_topics: z.array(z.string()).optional(),
    difficulty: z.string().min(1, "Difficulty is required"),
    correct_marks: z.number(),
    wrong_marks: z.number(),
    unattempt_marks: z.number(),
    total_time: z.number().min(1, "Duration required"),
    total_marks: z.number().min(1, "Total marks required"),
    total_questions: z.number().min(1, "Number of questions required"),
});
type FormData = z.infer<typeof schema>;

export default function CreateTestPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
    const [activeTab, setActiveTab] = useState("Chapter Wise");

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            correct_marks: 5,
            wrong_marks: -1,
            unattempt_marks: 0,
            topics: [],
            sub_topics: [],
            difficulty: "easy",
            type: "practice",
        },
    });

    const selectedSubject = watch("subject");
    const selectedTopics = watch("topics");

    useEffect(() => {
        api.get("/subjects").then((res) => {
            if (res.data.status === 'success') setSubjects(res.data.data);
        });
    }, []);

    useEffect(() => {
        if (!selectedSubject) return;
        api.get(`/topics/subject/${selectedSubject}`).then((res) => {
            if (res.data.status === 'success') setTopics(res.data.data);
            setValue("topics", []);
            setValue("sub_topics", []);
            setSubTopics([]);
        });
    }, [selectedSubject]);

    useEffect(() => {
        if (!selectedTopics?.length) return;
        api.post("/sub-topics/multi-topics", { topicIds: selectedTopics }).then((res) => {
            if (res.data.status === 'success') setSubTopics(res.data.data);
        });
    }, [JSON.stringify(selectedTopics)]);

    useEffect(() => {
        if(!id)return
        const fetchTestData = async () => {
            try {
                const testRes = await api.get(`/tests/${id}`);
                if (testRes.data.status === 'success') {
                    const t = testRes.data.data;

                    const subjectsRes = await api.get('/subjects');
                    const allSubjects = subjectsRes.data.data ?? [];
                    const matchedSubject = allSubjects.find((s: any) => s.name === t.subject);
                    const subjectId = matchedSubject ? matchedSubject.id : '';

                    let topicIdsToSet: string[] = [];
                    let allTopics: Topic[] = [];
                    if (subjectId) {
                        const topicsRes = await api.get(`/topics/subject/${subjectId}`);
                        allTopics = topicsRes.data.data ?? [];
                        topicIdsToSet = allTopics
                            .filter((tp: any) => t.topics?.includes(tp.name))
                            .map((tp: any) => tp.id);
                        setTopics(allTopics); 
                    }

                    let subTopicIdsToSet: string[] = [];
                    if (topicIdsToSet.length > 0) {
                        const subTopicsRes = await api.post('/sub-topics/multi-topics', {
                            topicIds: topicIdsToSet,
                        });
                        const allSubTopics = subTopicsRes.data.data ?? [];
                        subTopicIdsToSet = allSubTopics
                            .filter((stp: any) => t.sub_topics?.includes(stp.name))
                            .map((stp: any) => stp.id);
                        setSubTopics(allSubTopics);
                    }

                    reset({
                        name: t.name, type: t.type, subject: subjectId, 
                        topics: topicIdsToSet,
                        sub_topics: subTopicIdsToSet, 
                        difficulty: t.difficulty, correct_marks: t.correct_marks, wrong_marks: t.wrong_marks, unattempt_marks: t.unattempt_marks, total_time: t.total_time, total_marks: t.total_marks, total_questions: t.total_questions,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch test data for editing:", error);
                toast.error("Failed to load test details.");
            }
        }
        fetchTestData();
    }, [id, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            const typeMap: Record<string, string> = {
                "Chapter Wise": "mock",
                "PYQ": "pyq",
                "Mock Test": "mock",
            };

            const payload = {
                name: data.name,
                type: typeMap[activeTab] ?? "practice",
                subject: data.subject,
                topics: data.topics,
                sub_topics: data.sub_topics || [],
                correct_marks: Number(data.correct_marks),
                wrong_marks: Number(data.wrong_marks),
                unattempt_marks: Number(data.unattempt_marks),
                difficulty: data.difficulty,
                total_time: Number(data.total_time),
                total_marks: Number(data.total_marks),
                total_questions: Number(data.total_questions),
                status: "draft",   
            };

            if (isEdit) {
                await api.put(`/tests/${id}`, payload);
                toast.success("Test updated!");
                navigate(`/add-questions/${id}`);
            } else {
                const res = await api.post("/tests", payload);

                const testId = res.data?.data?.id;
                if (!testId) throw new Error("No test ID returned");
                toast.success("Test created!");
                navigate(`/add-questions/${testId}`);
            }
        } catch (err: any) {
            console.error("Error:", err.response?.data);
            toast.error(err.response?.data?.message || "Failed to save test");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-sm text-gray-400 mb-4">
                Test Creation /{" "}
                <span className="text-gray-600">{isEdit ? "Edit Test" : "Create Test"}</span> /{" "}
                <span className="text-blue-500">{activeTab}</span>
            </div>

            <div className="flex gap-1 mb-6 border border-gray-200 rounded-lg p-1 w-fit bg-gray-50">
                {["Chapter Wise", "PYQ", "Mock Test"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === tab
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <select
                                {...register("subject")}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choose from Drop-down</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name of Test</label>
                            <input
                                {...register("name")}
                                placeholder="Enter name of Test"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                            <select
                                multiple
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-28"
                                onChange={(e) => {
                                    const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
                                    setValue("topics", vals);
                                }}
                                value={watch("topics")}
                            >
                                {topics.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {errors.topics && <p className="text-red-500 text-xs mt-1">{errors.topics.message}</p>}
                            <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Topic</label>
                            <select
                                multiple
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-28"
                                onChange={(e) => {
                                    const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
                                    setValue("sub_topics", vals);
                                }}
                                value={watch("sub_topics")}
                            >
                                {subTopics.map((st) => (
                                    <option key={st.id} value={st.id}>{st.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Minutes)</label>
                            <input
                                {...register("total_time", { valueAsNumber: true })}
                                type="number"
                                placeholder="Enter the time"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.total_time && <p className="text-red-500 text-xs mt-1">{errors.total_time.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Test Difficulty Level</label>
                            <div className="flex gap-6 mt-1">
                                {["easy", "medium", "hard"].map((level) => (
                                    <label key={level} className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input
                                            type="radio"
                                            value={level}
                                            {...register("difficulty")}
                                            className="accent-blue-500"
                                        />
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Marking Scheme:</label>
                        <div className="grid grid-cols-5 gap-4">
                            {[
                                { label: "Wrong Answer", field: "wrong_marks" as const },
                                { label: "Unattempted", field: "unattempt_marks" as const },
                                { label: "Correct Answer", field: "correct_marks" as const },
                                { label: "No of Questions", field: "total_questions" as const },
                                { label: "Total Marks", field: "total_marks" as const },
                            ].map(({ label, field }) => (
                                <div key={field}>
                                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                                    <input
                                        {...register(field, { valueAsNumber: true })}
                                        type="number"
                                        placeholder="0"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="px-5 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Next"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}