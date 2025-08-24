import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Define service type
interface Service extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ services: Service[] } | { message: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const [rows] = await db.query<Service[]>(
      "SELECT id, title, description, image FROM services ORDER BY id DESC"
    );

    console.log("Fetched services:", rows);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No services found." });
    }

    res.status(200).json({ services: rows });
  } catch (error: unknown) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to fetch services",
    });
  }
}
