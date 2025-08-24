import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface AboutData extends RowDataPacket {
  title: string;
  description: string;
  image: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Query data from 'about' table
      const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM about LIMIT 1");
      const abouts = rows as AboutData[];

      if (abouts.length === 0) {
        return res.status(404).json({ message: "No About data found." });
      }

      return res.status(200).json(abouts[0]); // Return first row
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch About data.";
      console.error(errorMessage);
      return res.status(500).json({ message: errorMessage });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
