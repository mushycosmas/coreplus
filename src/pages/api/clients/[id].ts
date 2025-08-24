// src/pages/api/clients/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";
import { RowDataPacket } from "mysql2";

interface ClientRow extends RowDataPacket {
  logo?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PUT") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { name } = req.body;
    const logo = req.body.logo as string | undefined; // assume a new logo path is provided in request body

    if (!name) return res.status(400).json({ message: "Client name is required" });

    // Get existing logo
    const [existingRows] = await db.query<ClientRow[]>(
      "SELECT logo FROM clients WHERE id = ?",
      [id]
    );
    const existing = existingRows[0];

    // Delete old logo if a new one is provided
    if (logo && existing?.logo) {
      const oldPath = path.join(process.cwd(), "public", existing.logo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Update the client
    await db.query(
      "UPDATE clients SET name = ?, logo = ? WHERE id = ?",
      [name, logo || existing?.logo || null, id]
    );

    res.status(200).json({ id, name, logo: logo || existing?.logo || null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    res.status(500).json({ message });
  }
}
