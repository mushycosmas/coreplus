import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

// Define the shape of the contact_info data
interface ContactInfoData {
  email: string;
  phone: string;
  address: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Handle GET request to fetch all contact info
    if (req.method === "GET") {
      const [rows] = await db.query<ContactInfoData[]>("SELECT * FROM contact_info");
      return res.status(200).json(rows);
    }

    // Handle POST request to create new contact info
    if (req.method === "POST") {
      const { email, phone, address }: ContactInfoData = req.body;

      // Validate the request body
      if (!email || !phone || !address) {
        return res.status(400).json({ message: "All fields (email, phone, address) are required" });
      }

      // Insert new contact info into the database
      const [result] = await db.query(
        "INSERT INTO contact_info (email, phone, address) VALUES (?, ?, ?)",
        [email, phone, address]
      );

      // Respond with the created data
      return res.status(201).json({ id: (result as any).insertId, email, phone, address });
    }

    // Handle unsupported HTTP methods
    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    // Log error and return a generic message for internal server errors
    console.error(err);

    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
}
