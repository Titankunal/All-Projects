import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { QueryParser } from "./engines/QueryParser";
import { SystemDesignGenerator } from "./engines/SystemDesignGenerator";
import { DatabaseSchemaGenerator } from "./engines/DatabaseSchemaGenerator";
import { APIDesignGenerator } from "./engines/APIDesignGenerator";

const app = express();
const queryParser = new QueryParser();
const sysDesignGen = new SystemDesignGenerator();
const dbSchemaGen = new DatabaseSchemaGenerator();
const apiDesignGen = new APIDesignGenerator();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "srchr-backend", version: "1.0.0" });
});

app.post("/api/v1/generate", async (req, res) => {
  const start = Date.now();
  const { query } = req.body;

  if (!query || query.trim().length < 3) {
    return res.status(400).json({ success: false, error: "Query too short" });
  }

  const parsedQuery = queryParser.parse(query);
  const [architecture, database, api] = await Promise.all([
    Promise.resolve(sysDesignGen.generate(parsedQuery)),
    Promise.resolve(dbSchemaGen.generate(parsedQuery)),
    Promise.resolve(apiDesignGen.generate(parsedQuery)),
  ]);

  return res.json({
    success: true,
    data: {
      id: uuidv4(),
      query,
      parsedQuery,
      architecture,
      database,
      api,
      generatedAt: new Date().toISOString(),
      generationTimeMs: Date.now() - start
    },
    meta: { took_ms: Date.now() - start, cached: false }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔍 Srchr running on http://localhost:${PORT}`);
});
