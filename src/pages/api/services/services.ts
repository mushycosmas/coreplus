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

// Define API response types
type ResponseData =
  | { services: Service[] }
  | { message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Read limit from query (optional)
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : null;

    let query = "SELECT id, title, description, image FROM services ORDER BY id DESC";
    const params: any[] = [];

    if (limit && !isNaN(limit)) {
      query += " LIMIT ?";
      params.push(limit);
    }

    const [rows] = await db.query<Service[]>(query, params);

    if (!rows.length) {
      return res.status(404).json({ message: "No services found." });
    }

    return res.status(200).json({ services: rows });
  } catch (error: unknown) {
    console.error("Error fetching services:", error);

    return res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to fetch services",
    });
  }
}
