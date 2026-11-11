"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  source?: string;
}

export function QuestionCard({
  q,
  open,
  onToggle,
}: {
  q: Question;
  open: boolean;
  onToggle: () => void;
}) {
  const level = (q.difficulty || "Easy").toLowerCase();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`st-card overflow-hidden transition-all duration-300 ${open ? "shadow-st-hover" : ""}`}
    >
      <button onClick={onToggle} className="w-full p-5 text-left" aria-expanded={open}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className={`st-level ${level}`}>{q.difficulty}</span>
          {q.topic && <span className="st-hash">#{q.topic}</span>}
        </div>
        <h3 className="line-clamp-2 font-serif text-lg font-medium leading-snug text-st-ink">{q.question}</h3>
        <div className="mt-3 flex items-center justify-between font-mono text-xs text-st-muted">
          <span>{open ? "ẩn câu trả lời" : "xem câu trả lời"}</span>
          <FiChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180 text-st-accent" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t border-st-line p-5">
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: q.answer }}
              />
              {q.source && (
                <p className="mt-4 border-t border-st-line pt-3 font-mono text-xs text-st-muted">
                  nguồn:{" "}
                  {q.source.startsWith("http") ? (
                    <a href={q.source} target="_blank" rel="noopener noreferrer" className="st-link !text-xs">
                      {q.source}
                    </a>
                  ) : (
                    <span>{q.source}</span>
                  )}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function InterviewSection() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(collection(db, "interview_qna"), orderBy("createdAt", "desc"), limit(6));
        const snap = await getDocs(q);
        setQuestions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Question[]);
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="st-h2 !mb-2">
            Câu hỏi <em>phỏng vấn</em>
          </h2>
          <p className="st-body max-w-xl">Câu hỏi phỏng vấn thực tế về AI, Machine Learning và Engineering.</p>
        </div>
        <Link href="/interview" className="st-btn ghost">
          Xem tất cả <FiArrowRight />
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="st-card h-36 animate-pulse" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <p className="st-body mt-6">Chưa có câu hỏi nào.</p>
      ) : (
        <div className="mt-6 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
          {questions.map((q) => (
            <QuestionCard key={q.id} q={q} open={openId === q.id} onToggle={() => setOpenId(openId === q.id ? null : q.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
