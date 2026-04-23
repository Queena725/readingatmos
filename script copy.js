window.addEventListener("load", () => {
  const logo = document.querySelector(".logo path");
  logo.style.transition = "stroke-dashoffset 3s ease";
  logo.style.strokeDashoffset = 0;
});


const url =
  "https://real-time-news-data.p.rapidapi.com/search?query=environment&limit=7&time_published=anytime&country=US&lang=en";
const options = {
  method: "GET",
  headers: {
    "x-rapidapi-key": "ffedbf993fmsh5f4be06e91bc37bp138a38jsn342b5f0d58f9",
    "x-rapidapi-host": "real-time-news-data.p.rapidapi.com",
  },
};

const posWords = [
  "hope", "peace", "love", "green", "growth", "renewable", "nature", "tree", "forest", "planet",
  "clean", "light", "life", "bloom", "flower", "recycle", "revive", "balance", "harmony", "future",
  "fresh", "energy", "restore", "sustain", "thriving", "wildlife", "ocean", "air", "pure", "garden",
  "healing", "coexist", "together", "unity", "joy", "care", "compassion", "earth", "water", "home",
  "respect", "connection", "seed", "leaf", "community", "protect", "flourish", "solace", "calm", "gentle",
  "renewal", "rebirth", "awakening", "gentleness", "careful", "preserve", "clear", "embrace", "listen", "soft",
  "responsibility", "gratitude", "sunrise", "breeze", "rain", "river", "mountain", "soil", "organic", "cleanse",
  "transition", "restoration", "peaceful", "mindful", "adapt", "evolve", "hopeful", "safe", "inclusive", "compassionate",
  "lightness", "warmth", "tender", "freedom", "togetherness", "breathe", "open", "homecoming", "friendship", "reconnect",
  "renew", "heal", "wild", "diversity", "respectful", "transparent", "serenity", "natural", "joyful", "alive",
  "balance", "kindness", "growthful", "reconnect", "compromise",
  "blossom", "ecology", "symbiosis", "purity", "soothing",
  "stability", "flourishing", "equilibrium", "generosity", "wisdom",
  "kindred", "illumination", "gratitude", "understanding", "gentlewind"
];
const negWords = [  "crisis", "war", "pollution", "disaster", "collapse", "extinction", "climate", "conflict", "toxic", "deforestation",
  "drought", "flood", "earthquake", "fire", "storm", "hurricane", "violence", "waste", "meltdown", "smoke",
  "contamination", "oil", "damage", "threat", "decline", "loss", "destruction", "overheat", "emission", "carbon",
  "acid", "bleaching", "burning", "erosion", "hazard", "fear", "scarcity", "infection", "disease", "famine",
  "poverty", "exploit", "industrial", "radiation", "plastic", "chaos", "turmoil", "danger", "overuse", "tragedy",
  "collapse", "decay", "loss", "damage", "ruin", "scar", "smog", "overheat", "overconsume", "shortage",
  "confusion", "warfare", "violence", "injustice", "poverty", "greed", "exhaustion", "toxicity", "stress", "chaos",
  "radiation", "burnout", "fearful", "suffering", "contaminated", "industrialization", "isolation", "alienation", "plasticity", "depletion",
  "overfishing", "bleach", "acidic", "dryness", "collapse", "devastation", "erosion", "abuse", "exploit", "wounded",
  "hunger", "emergency", "flooding", "melting", "unrest", "turbulence", "fatal", "smoke", "threatened", "darkness",
   "contamination", "overload", "scarcity", "polluted", "erosive",
  "displacement", "heatwave", "wildfire", "smokestorm", "toxicwater",
  "infection", "panic", "ruination", "decay", "greediness",
  "overmining", "unsustainable", "wasteland", "collapse", "fragmentation"
];



function map(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

async function fetchNewsData() {
  let articles = [];

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    if (result.data && result.data.length > 0) {
      articles = result.data.slice(0, 12);
    } else {
      throw new Error("empty data");
    }
  } catch (e) {
    console.warn(" Using fallback data");
    for (let i = 0; i < 12; i++) {
      articles.push({
        title: "environment humanity peace growth",
        summary: "hope love planet nature",
      });
    }
  }

  const logos = document.querySelectorAll(".atmosLogo");


  const untouchedIndex = Math.floor(Math.random() * logos.length);
  console.log(`Original untouched day: ${untouchedIndex}`);

  articles.forEach((article, i) => {
    const title = article.title?.toLowerCase() || "";
    const desc = article.summary?.toLowerCase() || "";
    const text = title + " " + desc;

    let score = 0;
    posWords.forEach((w) => text.includes(w) && score++);
    negWords.forEach((w) => text.includes(w) && score--);

    const positivity = map(score, -5, 5, 0, 1);
    const dash = map(positivity, 0, 1, 5, 0);
    const fillOpacity = map(positivity, 0, 1, 0, 1);
    const strokeColor = `hsl(${map(positivity, 0, 1, 0, 120)}, 30%, 25%)`;

    const svg = logos[i];
    const paths = svg.querySelectorAll("path");

    if (i === untouchedIndex) {
      
      paths[0].style.strokeDasharray = "none";
      paths.forEach((p, idx) => {
        if (idx > 0) {
          p.style.fill = "black";
          p.style.fillOpacity = 1;
        }
      });
      svg.style.opacity = 1;
      return;
    }

  
    const outline = paths[0];
    const fills = [...paths].slice(1);

    outline.style.strokeDasharray = `${dash} ${dash}`;
    outline.style.stroke = strokeColor;
    outline.style.transition = "all 2.5s ease";
    outline.style.transitionDelay = `${i * 0.3}s`;

    fills.forEach((f, idx) => {
      f.style.transition = "fill-opacity 2s ease";
      f.style.fillOpacity = fillOpacity;
      f.style.transitionDelay = `${i * 0.3 + idx * 0.2}s`;
    });

    svg.style.opacity = map(positivity, 0, 1, 0.4, 1);
  });
}

fetchNewsData();

const dotLogos = document.querySelectorAll(".dotLogo");


dotLogos.forEach((dot, i) => {
  dot.style.opacity = 0.4;
  setTimeout(() => {
    dot.style.opacity = 1;
  }, 1000 + i * 500);
});