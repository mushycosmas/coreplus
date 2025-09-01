import { db } from "@/lib/db";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { ResultSetHeader } from "mysql2";

export const config = {
  api: { bodyParser: false },
};

interface ClientData {
  id: number;
  name: string;
  logo?: string | null;
  created_at: string;
}

interface ClientFormFields {
  name?: string | string[];
}

interface ClientFiles {
  logo?: File | File[];
}

// Wrap formidable parse in a promise
function parseForm(req: Request): Promise<{ fields: ClientFormFields; files: ClientFiles }> {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    // `formidable` typings expect Node IncomingMessage, cast Request to Node type
    form.parse(req as unknown as NodeJS.ReadableStream, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields: fields as ClientFormFields, files: files as ClientFiles });
    });
  });
}

export async function POST(req: Request) {
  try {
    const { fields, files } = await parseForm(req);

    let name = "";
    if (Array.isArray(fields.name)) name = fields.name[0];
    else if (typeof fields.name === "string") name = fields.name;

    if (!name.trim()) {
      return new Response(JSON.stringify({ message: "Client name is required" }), { status: 400 });
    }

    let logoPath: string | null = null;
    const logoFile = files.logo;
    if (logoFile) {
      if (Array.isArray(logoFile) && logoFile[0]?.filepath) {
        logoPath = `/uploads/${path.basename(logoFile[0].filepath)}`;
      } else if ((logoFile as File)?.filepath) {
        logoPath = `/uploads/${path.basename((logoFile as File).filepath)}`;
      }
    }

    const result = await db.query<ResultSetHeader>(
      "INSERT INTO clients (name, logo) VALUES (?, ?)",
      [name, logoPath]
    );

    // Type-safe cast for insertId
    const insertId = (result[0] as ResultSetHeader).insertId;

    return new Response(JSON.stringify({ id: insertId, name, logo: logoPath }), { status: 201 });
  } catch (err: unknown) {
    console.error("Error creating client:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ message }), { status: 500 });
  }
}

export async function GET() {
  try {
    const [rows] = await db.query<ClientData[]>("SELECT * FROM clients ORDER BY created_at DESC");
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ message }), { status: 500 });
  }
}
