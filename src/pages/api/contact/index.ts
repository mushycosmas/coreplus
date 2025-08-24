import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

// Define the shape of the contact data for POST requests
interface ContactData {
  email: string;
  phone: string;
  address: string;
  message: string;
}

// Define the type for a response from the database insert
interface ContactInsertResult {
  insertId: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      // Fetch all contact records from the database
      const [rows] = await db.query<ContactData[]>("SELECT * FROM contact");
      return res.status(200).json(rows); // Return the fetched contacts
    }

    if (req.method === "POST") {
      // Ensure the body has the correct data
      const { email, phone, address, message } = req.body;
      
      // Basic validation for required fields
      if (!email || !phone || !address || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Insert the contact data into the database
      const [result] = await db.query<ContactInsertResult>("INSERT INTO contact (email, phone, address, message) VALUES (?, ?, ?, ?)", [
        email,
        phone,
        address,
        message,
      ]);

      // Respond with the inserted contact details
      return res.status(201).json({
        id: result.insertId, // Get the ID of the inserted record
        email,
        phone,
        address,
        message,
      });
    }

    // If the method is neither GET nor POST
    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    // Log and handle errors
    console.error(err);

    if (err instanceof Error) {
      return res.status(500).json({ message: err.message }); // More specific error message
    }

    return res.status(500).json({ message: "Internal server error" });
  }
}
