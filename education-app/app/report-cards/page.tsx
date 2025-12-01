import CountryEducationReportCards from "@/components/country-report/CountryEducationReportCards";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ReportCardsPage() {
  return (
    <main className="min-h-screen bg-[#2d3e30] relative overflow-y-auto">
      {/* Back Button */}
      <Link href="/" className="absolute top-4 left-4 z-50">
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowLeft size={16} /> Exit
        </Button>
      </Link>

      <div className="pt-16 pb-20">
        <CountryEducationReportCards />
      </div>
    </main>
  );
}

