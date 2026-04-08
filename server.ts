import express from "express";
import SpotifyWebApi from "spotify-web-api-node";
import vader from "vader-sentiment";
import natural from "natural";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------- DATABASE ---------------- */

const db = new Database("wellness.db");

db.exec(`
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  emotion TEXT,
  stress_level TEXT,
  sentiment REAL
)
`);

const insertLog = db.prepare(
  "INSERT INTO logs (emotion, stress_level, sentiment) VALUES (?, ?, ?)"
);

const getLogs = db.prepare(
  "SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100"
);

const getStats = db.prepare(`
SELECT emotion, COUNT(*) as count 
FROM logs 
GROUP BY emotion
`);

/* ---------------- EXPRESS ---------------- */

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}));
const PORT = 3000;
app.options("*", cors());

app.use(express.json());

app.use("/api", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

/* ---------------- GEMINI AI ---------------- */

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/* ---------------- SPOTIFY ---------------- */

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

async function getSpotifyToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body.access_token);
    console.log("Spotify token set");
  } catch (err) {
    console.error("Spotify token error:", err);
  }
}

if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
  getSpotifyToken();
  setInterval(getSpotifyToken, 50 * 60 * 1000);
}

/* ---------------- CHATBOT TRAINING ---------------- */

const intentsPath = path.join(__dirname, "src", "intents.json");
const intentsData = JSON.parse(fs.readFileSync(intentsPath, "utf-8"));

const classifier = new natural.LogisticRegressionClassifier();

intentsData.intents.forEach((intent) => {
  intent.patterns.forEach((pattern) => {
    classifier.addDocument(pattern, intent.tag);
  });
});

classifier.addDocument("help me", "help");
classifier.addDocument("what?", "fallback");

classifier.train();

const analyzer = vader.SentimentIntensityAnalyzer;

/* ---------------- MUSIC API ---------------- */

app.get("/api/recommend-music", async (req, res) => {
  try {
    const { emotion } = req.query;

    if (!emotion) {
      return res.status(400).json({ error: "Emotion required" });
    }

    const moodMap = {
      happy: "energetic upbeat",
      sad: "uplifting motivational",
      angry: "calming peaceful",
      fear: "relaxing soothing",
      stressed: "lofi chill",
      neutral: "lofi chill"
    };

    const query = moodMap[String(emotion).toLowerCase()] || "lofi chill";

    const fallbackTracks = [
      {
        id: "609By9vX7ytM26T943Qjcs",
        name: "Weightless",
        artist: "Marconi Union",
        albumCover:
          "https://images.unsplash.com/photo-1459749411177-042180ce673c",
        previewUrl: null,
        externalUrl: "https://open.spotify.com/track/609By9vX7ytM26T943Qjcs"
      }
    ];

    if (!spotifyApi.getAccessToken()) {
      return res.json({ tracks: fallbackTracks, isFallback: true });
    }

    const result = await spotifyApi.searchTracks(query, { limit: 5 });

    const tracks = result.body.tracks.items.map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artists[0].name,
      albumCover: t.album.images[0]?.url,
      previewUrl: t.preview_url,
      externalUrl: t.external_urls.spotify
    }));

    res.json({ tracks, isFallback: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Music error" });
  }
});

/* ---------------- CHAT ANALYSIS ---------------- */

app.post("/api/chat", (req, res) => {
  const { message } = req.body;

  const tag = classifier.classify(message);
  const sentiment = analyzer.polarity_scores(message);

  let emotion = "neutral";

  if (sentiment.compound > 0.5) emotion = "happy";
  else if (sentiment.compound < -0.4) emotion = "sad";
  else if (sentiment.compound < -0.2) emotion = "stressed";

  res.json({
    tag,
    sentiment: sentiment.compound,
    emotion,
    stressLevel:
      sentiment.compound < -0.3 ? "high" :
      sentiment.compound < 0 ? "medium" :
      "low",
    keywords: message.split(" ").slice(0, 3),
    history: []
  });
});

/* ---------------- AI RESPONSE ---------------- */

app.post("/api/ai-response", async (req, res) => {
  try {
    const { message, analysis } = req.body;

    const systemInstruction = `
You are Aria, a friendly human-like AI assistant.

Speak naturally like a real human.
Keep responses short (1–2 sentences).
Be caring and supportive.

Emotion detected: ${analysis?.emotion}
Intent: ${analysis?.tag}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({
      reply: response.text
    });

  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "AI failed" });
  }
});

/* ---------------- LOGGING ---------------- */

app.post("/api/logs", (req, res) => {
  const { emotion, stressLevel, sentiment } = req.body;

  insertLog.run(emotion, stressLevel, sentiment);

  res.json({ success: true });
});

/* ---------------- DASHBOARD ---------------- */

app.get("/api/dashboard", (req, res) => {
  res.json({
    logs: getLogs.all(),
    stats: getStats.all()
  });
});

/* ---------------- START SERVER ---------------- */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});