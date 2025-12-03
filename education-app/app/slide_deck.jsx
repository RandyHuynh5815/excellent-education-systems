import { useEffect, useState } from "react";
import Papa from "papaparse";
import { useSwipeable } from "react-swipeable";

// Convert country name to flag filename (lowercase, spaces to hyphens)
function getCountryFlagPath(country) {
  const filename = country
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `/flags/${filename}.png`;
}

export default function App() {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);

  // Load CSV once
  useEffect(() => {
    Papa.parse("/country_facts_ranked.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data
          .map((row) => ({
            country: row.country,
            ranking: Number(row.ranking),
            fact1: row.fact1,
            fact2: row.fact2,
            fact3: row.fact3,
          }))
          .sort((a, b) => a.ranking - b.ranking); // 1..80

        setCards(data);
        setIndex(0);
      },
    });
  }, []);

  const total = cards.length;

  // Infinite loop: move index and wrap around
  const goNext = () => {
    if (!total) return;
    setIndex((i) => (i + 1) % total);
  };

  const goPrev = () => {
    if (!total) return;
    setIndex((i) => (i - 1 + total) % total);
  };

  const handlers = useSwipeable({
    onSwipedLeft: goNext,
    onSwipedRight: goPrev,
    trackMouse: true,
  });

  if (!total) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 20,
        }}
      >
        Loading…
      </div>
    );
  }

  const current = cards[index];

  return (
    <div
      {...handlers}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#f3f4f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Card */}
      <div
        style={{
          width: 330,
          minHeight: 420,
          background: "#fffef5",
          border: "2px solid #111",
          borderRadius: 10,
          padding: 20,
          boxShadow: "0 6px 15px rgba(0,0,0,0.12)",
          transition: "transform 0.2s ease, opacity 0.2s ease",
          position: "relative",
        }}
      >
        {/* Country Flag - Top Right */}
        <img
          src={getCountryFlagPath(current.country)}
          alt={`${current.country} flag`}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 48,
            height: 48,
            objectFit: "cover",
            borderRadius: 4,
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />

        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
            paddingRight: 56,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: "#777" }}>Country</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {current.country}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#777" }}>Math Rank</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {current.ranking}/80
            </div>
          </div>
        </div>

        {/* Facts */}
        <ul
          style={{
            paddingLeft: 18,
            marginTop: 14,
            lineHeight: 1.5,
            fontSize: 15,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <li>{current.fact1}</li>
          <li>{current.fact2}</li>
          <li>{current.fact3}</li>
        </ul>
      </div>

      {/* Left arrow */}
      <button
        onClick={goPrev}
        style={{
          position: "absolute",
          left: 24,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 30,
          background: "rgba(255,255,255,0.85)",
          border: "none",
          borderRadius: "50%",
          width: 44,
          height: 44,
          cursor: "pointer",
        }}
      >
        ‹
      </button>

      {/* Right arrow */}
      <button
        onClick={goNext}
        style={{
          position: "absolute",
          right: 24,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 30,
          background: "rgba(255,255,255,0.85)",
          border: "none",
          borderRadius: "50%",
          width: 44,
          height: 44,
          cursor: "pointer",
        }}
      >
        ›
      </button>

      {/* Dots indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          display: "flex",
          gap: 6,
        }}
      >
        {cards.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 14 : 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: i === index ? "#111" : "#aaa",
              transition: "all 0.2s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
