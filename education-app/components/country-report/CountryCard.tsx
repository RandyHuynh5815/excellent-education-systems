import { CountryEducationStats } from "@/lib/countryReportData";

interface CountryCardProps {
  country: CountryEducationStats;
}

export function CountryCard({ country }: CountryCardProps) {
  // Helpers to normalize specific fields for bar width (0-100%)
  // Hardcoding min/max based on expected range for simple visualization
  const getBarWidth = (value: number, min: number, max: number) => {
    const pct = ((value - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  const Indicator = ({ label, value, min, max, reverse = false, displayValue }: any) => {
    const width = getBarWidth(value, min, max);
    // Green for good (high or low depending on reverse), Red/Gray for bad?
    // Let's stick to simple "longer is usually 'more'" but color code "better"
    // Actually, simple neutral bars are often clearer, maybe color the bar based on "goodness"
    
    let colorClass = "bg-chalk-blue";
    if (reverse) {
      // For negative indicators (bullying), low is good (green), high is bad (red)
      // We'll map the "badness" to color intensity or just use a distinct color
      colorClass = "bg-chalk-red"; 
    }

    return (
      <div className="mb-2 text-sm">
        <div className="flex justify-between mb-1 text-chalk-white/80">
          <span>{label}</span>
          <span className="font-mono">{displayValue || value}</span>
        </div>
        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
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
          label="Feeling Safe (%)" 
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

