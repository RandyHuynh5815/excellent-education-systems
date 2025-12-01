"use client";

import { useState } from "react";
import { STUDENTS, VISUALIZATIONS, QUESTIONS } from "@/lib/data";
import { Student, Question, VisualizationData } from "@/lib/types";
import { StudentAvatar } from "@/components/classroom/StudentAvatar";
import { Whiteboard } from "@/components/classroom/Whiteboard";
import { FilterPanel } from "@/components/classroom/FilterPanel";
import { Notebook } from "@/components/classroom/Notebook";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ClassroomPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  // Histogram filter state
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "BELONG",
    "BULLIED",
    "FEELSAFE",
  ]);
  const [histogramSortBy, setHistogramSortBy] = useState<string>("none");
  const [histogramSortOrder, setHistogramSortOrder] = useState<"asc" | "desc">(
    "asc"
  );

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleCountryToggle = (country: string) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter((c) => c !== country));
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const currentQuestion: Question | null = selectedStudent
    ? QUESTIONS.find((q) => q.id === selectedStudent.questionId) || null
    : null;

  const currentData: VisualizationData | null = selectedStudent
    ? VISUALIZATIONS[selectedStudent.questionId] || null
    : null;

  const isHistogram = currentData?.type === "histogram";

  const handleMetricToggle = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      const newMetrics = selectedMetrics.filter((m) => m !== metric);
      setSelectedMetrics(newMetrics);
      // If the currently sorted metric is being deselected, reset sort to "none"
      if (histogramSortBy === metric) {
        setHistogramSortBy("none");
      }
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#2d3e30]">
      {/* Back Button */}
      <Link href="/" className="absolute top-4 left-4 z-50">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft size={16} /> Exit
        </Button>
      </Link>

      {/* Classroom Background / Floor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 w-full h-1/3 bg-[#3e2b26] border-t-8 border-[#5d4037]"></div>
        {/* Desks could go here as SVGs */}
      </div>

      {/* Whiteboard Area */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-[95%] max-w-[1400px] h-[75vh] bg-[#1a261d] border-[16px] border-[#8d6e63] rounded-lg shadow-2xl z-30 flex flex-col overflow-hidden pointer-events-auto">
        {/* Chalk tray */}
        <div className="absolute bottom-0 w-full h-4 bg-[#8d6e63] opacity-50 pointer-events-none z-20"></div>
        <Whiteboard
          data={currentData}
          question={currentQuestion}
          filteredCountries={selectedCountries}
          selectedMetrics={selectedMetrics}
          histogramSortBy={histogramSortBy}
          histogramSortOrder={histogramSortOrder}
        />
      </div>

      {/* Students */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {STUDENTS.map((student) => (
          <StudentAvatar
            key={student.id}
            student={student}
            isSelected={selectedStudent?.id === student.id}
            onClick={handleStudentClick}
          />
        ))}
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onToggle={() => setIsFilterOpen(!isFilterOpen)}
        selectedCountries={selectedCountries}
        onCountryChange={handleCountryToggle}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        showHistogramFilters={isHistogram}
        selectedMetrics={selectedMetrics}
        onMetricToggle={handleMetricToggle}
        histogramSortBy={histogramSortBy}
        onHistogramSortByChange={setHistogramSortBy}
        histogramSortOrder={histogramSortOrder}
        onHistogramSortOrderChange={setHistogramSortOrder}
      />

      {/* Notebook */}
      <Notebook />
    </main>
  );
}
