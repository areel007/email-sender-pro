import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { transporter } from "./mailer";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

const limiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const contactSchema = z.object({
  firstname: z.string().trim().min(1).max(100),
  lastname: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255).optional(),
  message: z.string().trim().max(2000).optional(),
  username: z.string().trim().min(1).max(100).optional(),
  password: z.string().trim().min(1).max(100).optional(),
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/contact", limiter, async (req: Request, res: Response) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const { firstname, lastname, email, message, username, password } =
    parsed.data;
  const { MAIL_FROM, MAIL_TO } = process.env;

  if (!MAIL_FROM || !MAIL_TO) {
    return res.status(500).json({ error: "Server email is not configured" });
  }

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: email,
      subject: `New submission from ${firstname} ${lastname}`,
      text: [
        `First name: ${firstname}`,
        `Last name: ${lastname}`,
        email ? `Email: ${email}` : null,
        message ? `\nMessage:\n${message}` : null,
        username ? `\nUsername: ${username}` : null,
        password ? `\nPassword: ${password}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("sendMail failed", err);
    return res.status(502).json({ error: "Failed to send email" });
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
