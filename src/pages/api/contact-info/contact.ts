import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db"; // adjust path to your db connection

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const [rows] = await db.query("SELECT email, phone, address FROM contact_info LIMIT 1");
      return res.status(200).json(rows[0]); // return only one record
    }
    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
