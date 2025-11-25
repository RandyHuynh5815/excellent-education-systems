import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const DEFAULT_MAX_COUNTRIES = 3;

// Default country list used in your project; can be overridden via props
const DEFAULT_COUNTRIES = [
  'Brazil',
  'Cambodia',
  'China',
  'Finland',
  'Japan',
  'Singapore',
  'United States',
];

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',');

  const rows = lines.slice(1).map((line) => {
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i];
    });
    return obj;
  });

  return { headers, rows };
}

/**
 * Reusable radar (spider) chart component for React.
 *
 * Props:
 * - csvUrl: string (URL/path to spiderplot.csv, e.g. "/spiderplot.csv")
 * - countries: string[] (list of country names to expose as options)
 * - maxCountries: number (max number of selectable countries)
 * - title: string (optional heading above the chart)
 * - description: string (optional subtitle text)
 */
export default function SpiderRadarChart({
  csvUrl = '/spiderplot.csv',
  countries = DEFAULT_COUNTRIES,
  maxCountries = DEFAULT_MAX_COUNTRIES,
  title = 'Country Comparison Radar Chart',
  description = 'Select up to 3 countries to compare their percentile scores across multiple dimensions.',
}) {
  const [statColumns, setStatColumns] = useState([]);
  const [dataByCountry, setDataByCountry] = useState({});
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [error, setError] = useState('');

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const prevSelectedRef = useRef([]);
  const animationFrameRef = useRef(null);

  // Load CSV on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(csvUrl);
        if (!res.ok) {
          throw new Error(`Failed to load CSV from ${csvUrl}`);
        }
        const text = await res.text();
        const { headers, rows } = parseCsv(text);

        const stats = headers.filter(
          (h) => h !== 'Country Name' && h !== 'Country Code'
        );

        const byCountry = {};
        rows.forEach((row) => {
          const name = row['Country Name'];
          if (!name) return;

          byCountry[name] = {};
          stats.forEach((col) => {
            const val = row[col];
            const num = val === undefined || val === '' ? null : Number(val);
            byCountry[name][col] = Number.isNaN(num) ? null : num;
          });
        });

        setStatColumns(stats);
        setDataByCountry(byCountry);
      } catch (e) {
        console.error(e);
        setError(
          `Error loading data from ${csvUrl}. Check the console and file location.`
        );
      }
    }

    loadData();
  }, [csvUrl]);

  // Initialize / update Chart.js radar chart when data or selection changes
  useEffect(() => {
    if (!statColumns.length || !chartRef.current) {
      return;
    }

    const ctx = chartRef.current.getContext('2d');

    const palette = [
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
    ];

    // Build full data for each selected country
    const fullDataByCountry = {};
    selectedCountries.forEach((name) => {
      const stats = dataByCountry[name];
      if (!stats) return;
      fullDataByCountry[name] = statColumns.map((col) => stats[col] ?? 0);
    });

    // Create chart once
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: statColumns,
          datasets: [],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false, // manual animation
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label(context) {
                  const value = context.parsed.r;
                  return `${context.dataset.label}: ${value.toFixed(
                    1
                  )}th percentile`;
                },
              },
            },
          },
          scales: {
            r: {
              suggestedMin: 0,
              suggestedMax: 100,
              grid: {
                color: 'rgba(255, 255, 255, 0.2)',
              },
              angleLines: {
                color: 'rgba(255, 255, 255, 0.4)',
              },
              pointLabels: {
                color: '#ffffff',
              },
              ticks: {
                color: '#ffffff',
                showLabelBackdrop: false,
                backdropColor: 'rgba(0,0,0,0)',
                callback(value) {
                  return value + '%';
                },
              },
            },
          },
        },
      });
    }

    const chart = chartInstanceRef.current;

    // Cancel any in-flight manual animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Keep labels in sync
    chart.data.labels = statColumns;

    const prevSelected = prevSelectedRef.current;

    // Remove datasets for countries that are no longer selected
    chart.data.datasets = chart.data.datasets.filter((ds) =>
      selectedCountries.includes(ds.label)
    );

    // Update existing datasets with latest values and colors
    chart.data.datasets.forEach((ds) => {
      const name = ds.label;
      const data = fullDataByCountry[name];
      if (!data) return;

      const idx = selectedCountries.indexOf(name);
      const color = palette[idx % palette.length];

      ds.data = data;
      ds.borderColor = color;
      ds.backgroundColor = color.replace('0.6', '0.2');
      ds.pointBackgroundColor = color;
    });

    // Find newly selected countries
    const newCountries = selectedCountries.filter(
      (name) => !prevSelected.includes(name) && dataByCountry[name]
    );

    // Add datasets for new countries starting at 0 (will animate out)
    newCountries.forEach((name) => {
      const fullData = fullDataByCountry[name];
      if (!fullData) return;
      const idx = selectedCountries.indexOf(name);
      const color = palette[idx % palette.length];

      chart.data.datasets.push({
        label: name,
        data: fullData.map(() => 0),
        borderColor: color,
        backgroundColor: color.replace('0.6', '0.2'),
        pointBackgroundColor: color,
        fill: true,
      });
    });

    chart.update();

    // Manually animate only the newly added countries from 0 -> full values
    if (newCountries.length > 0) {
      const duration = 1000;
      const start = performance.now();

      const animate = (now) => {
        const t = Math.min((now - start) / duration, 1);

        newCountries.forEach((name) => {
          const fullData = fullDataByCountry[name];
          const ds = chart.data.datasets.find((d) => d.label === name);
          if (!ds || !fullData) return;
          ds.data = fullData.map((v) => v * t);
        });

        chart.update();

        if (t < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    prevSelectedRef.current = [...selectedCountries];

    return () => {
      // Optional cleanup when component unmounts
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [statColumns, dataByCountry, selectedCountries]);

  function handleCountryToggle(country) {
    setSelectedCountries((current) => {
      const isSelected = current.includes(country);

      if (isSelected) {
        return current.filter((c) => c !== country);
      }

      if (current.length >= maxCountries) {
        return current;
      }

      return [...current, country];
    });
  }

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '40px auto',
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {title && (
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          {title}
        </h1>
      )}
      {description && (
        <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {description}
        </p>
      )}

      {error && (
        <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '24px',
        }}
      >
        <div
          style={{
            minWidth: '220px',
          }}
        >
          <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>
            Choose up to {maxCountries} countries:
          </p>
          {countries.map((country) => (
            <label
              key={country}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.25rem',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={selectedCountries.includes(country)}
                onChange={() => handleCountryToggle(country)}
              />
              <span>{country}</span>
            </label>
          ))}
        </div>

        <div
          style={{
            position: 'relative',
            height: '500px',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            flex: 1,
          }}
        >
          {!statColumns.length ? (
            <p style={{ textAlign: 'center', marginTop: '2rem' }}>
              Loading data from {csvUrl}...
            </p>
          ) : (
            <canvas ref={chartRef} />
          )}
        </div>
      </div>
    </div>
  );
}


