import { CountryEducationStats } from "@/lib/countryReportData";
import { Info } from "lucide-react";

interface CountryCardProps {
  country: CountryEducationStats;
}

const TOOLTIPS: Record<string, string> = {
  "Math Score": "Average score on the PISA mathematics assessment (mean ~500).",
  "Socio-Econ Status (ESCS)": "Index of Economic, Social and Cultural Status. Higher values indicate higher socioeconomic background.",
  "Parent Education (HISEI)": "Highest International Socio-Economic Index of Occupational Status. A proxy for parental education/status.",
  "Sense of Belonging": "Index of students' reported feeling of acceptance and inclusion at school.",
  "Feeling Safe": "Percentage of students who report feeling safe at school.",
  "Bullying Index": "Composite index of exposure to bullying. Higher values mean more frequent bullying.",
};

export function CountryCard({ country }: CountryCardProps) {
  const getBarWidth = (value: number, min: number, max: number) => {
    const pct = ((value - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  const Indicator = ({ label, value, min, max, reverse = false, displayValue }: any) => {
    const width = getBarWidth(value, min, max);
    let colorClass = "bg-chalk-blue";
    if (reverse) {
      colorClass = "bg-chalk-red";
    }

    return (
      <div className="mb-2 text-sm group relative">
        <div className="flex justify-between mb-1 text-black/80 font-semibold items-center">
          <div className="flex items-center gap-1 cursor-help">
            <span>{label}</span>
            <Info size={12} className="text-black/40 hover:text-black/80" />
            
            {/* Tooltip */}
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-black/90 text-white text-xs rounded z-20 pointer-events-none shadow-xl">
              {TOOLTIPS[label] || "No description available."}
              <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black/90"></div>
            </div>
          </div>
          <span className="font-mono">{displayValue || value}</span>
        </div>
        <div className="h-3 w-full bg-black/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass} transition-all duration-500`}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#fffef5] text-black p-6 rounded-lg shadow-lg border-4 border-wood-frame rotate-1 hover:rotate-0 transition-transform duration-300">
      <h3 className="text-2xl font-bold font-handwriting mb-4 border-b-2 border-black/10 pb-2">
        {country.name}
      </h3>

      <div className="space-y-3 font-sans">
        <Indicator
          label="Math Score"
          value={country.mathScore}
          min={300} max={600}
          displayValue={`${country.mathScore} pts`}
        />
        <Indicator
          label="Socio-Econ Status (ESCS)"
          value={country.escs}
          min={-2} max={1}
          displayValue={country.escs.toFixed(2)}
        />
        <Indicator
          label="Parent Education (HISEI)"
          value={country.hisei}
          min={30} max={90}
        />
        <Indicator
          label="Sense of Belonging"
          value={country.senseOfBelonging}
          min={-0.5} max={0.5}
          displayValue={country.senseOfBelonging.toFixed(2)}
        />
        <Indicator
          label="Feeling Safe"
          value={country.feelsSafe}
          min={0} max={100}
          displayValue={`${country.feelsSafe}%`}
        />
        <Indicator
          label="Bullying Index"
          value={country.bullying}
          min={0} max={1}
          reverse={true}
          displayValue={country.bullying.toFixed(2)}
        />
      </div>
    </div>
  );
}
