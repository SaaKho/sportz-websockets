import { Router } from "express";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
import { desc, eq } from "drizzle-orm";
import { getMatchStatus, syncMatchStatus } from "../utils/match-status.js";

export const matchesRouter = Router();

const MAX_LIMIT = 100;

matchesRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request query",
      details: parsed.error.issues,
    });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const rows = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    await Promise.all(
      rows.map((match) =>
        syncMatchStatus(match, async (nextStatus) => {
          await db
            .update(matches)
            .set({ status: nextStatus })
            .where(eq(matches.id, match.id));
        }),
      ),
    );

    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error("Failed to list matches:", error);
    return res.status(500).json({ error: "Failed to list matches" });
  }
});

matchesRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.issues,
    });
  }

  const { startTime, endTime, homeScore, awayScore } = parsed.data;
  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();
      
      if(res.app.locals.broadcastMatchCreated){
        res.app.locals.broadcastMatchCreated(event);
      }

    return res.status(201).json({ data: event });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: JSON.stringify(error) });
  }
});
