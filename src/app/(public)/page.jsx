"use client";

import { useRouter } from "next/navigation";

export default function AssessmentMenu() {
  const router = useRouter();

  const buttons = [
    { label: "پازل", path: "/Assessment/puzzle" },
    { label: "درهم‌ریختگی کلمات", path: "/Assessment/scramble" },
    { label: "کلمات جفتی", path: "/Assessment/word_pairs" },
    { label: "pathfinder - round1", path: "/Assessment/pathfinder/round1" },
    { label: "pathfinder - round2", path: "/Assessment/pathfinder/round2" },
    { label: "remember the numbers in order", path: "/Assessment/numbers" },
    { label: "پرسشنامه 1", path: "/Assessment/questionnaire" },
    { label: "پرسشنامه 2", path: "/Assessment/questionnaire" },
  ];

  return (
    <div
      dir="rtl"
      style={{
        padding: "60px",
        textAlign: "center",
        fontFamily: "sans-serif"
      }}
    >
      <h1 style={{ marginBottom: "40px" }}>
        پنل ارزیابی شناختی
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 200px)",
          gap: "20px",
          justifyContent: "center"
        }}
      >
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={() => router.push(btn.path)}
            style={{
              padding: "15px",
              fontSize: "16px",
              backgroundColor: "white",
              border: "2px solid black",
              cursor: "pointer"
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}