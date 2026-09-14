import { NextResponse, type NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { getCertificateByCode } from "@/server/queries/campus";
import { siteConfig } from "@/lib/site";

const JADE = rgb(0.059, 0.431, 0.337);
const INK = rgb(0.063, 0.078, 0.094);
const MUTED = rgb(0.353, 0.38, 0.412);
const GOLD = rgb(0.722, 0.537, 0.169);
const PAPER = rgb(0.969, 0.957, 0.933);

function formatLong(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

/** Public, code-addressed certificate PDF. Anyone with the code can download it — the same trust model as the verification page. */
export async function GET(_request: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const normalised = code.toUpperCase();
  if (!/^[A-Z0-9-]{8,32}$/.test(normalised)) return NextResponse.json({ error: "invalid_code" }, { status: 400 });

  const cert = await getCertificateByCode(normalised);
  if (!cert || cert.revokedAt) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const verifyUrl = `${siteConfig.url}/verify/${cert.code}`;
  const qrPng = await QRCode.toBuffer(verifyUrl, { errorCorrectionLevel: "M", margin: 0, width: 240, color: { dark: "#101418", light: "#f7f4ee" } });

  const pdf = await PDFDocument.create();
  pdf.setTitle(`${cert.user.name} — ${cert.course.title}`);
  pdf.setAuthor(siteConfig.name);
  pdf.setSubject("Certificate of completion");
  pdf.setCreator("PIOAI Campus");

  const page = pdf.addPage([841.89, 595.28]); // A4 landscape
  const { width, height } = page.getSize();
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: 0, width, height, color: PAPER });
  page.drawRectangle({ x: 0, y: 0, width: 18, height, color: JADE });
  page.drawRectangle({ x: 36, y: 36, width: width - 72, height: height - 72, borderColor: rgb(0.85, 0.83, 0.78), borderWidth: 1 });

  // Mark + wordmark
  page.drawRectangle({ x: 64, y: height - 92, width: 28, height: 28, color: JADE, borderWidth: 0 });
  page.drawText("PIOAI", { x: 102, y: height - 84, size: 18, font: serif, color: INK });
  page.drawText("PAKISTAN INSTITUTE OF AI", { x: 102, y: height - 98, size: 7.5, font: sans, color: MUTED });

  page.drawText("CERTIFICATE OF COMPLETION", { x: 64, y: height - 160, size: 9, font: sansBold, color: MUTED });
  page.drawText("This certifies that", { x: 64, y: height - 200, size: 13, font: serifItalic, color: MUTED });

  const nameSize = cert.user.name.length > 26 ? 34 : 42;
  page.drawText(cert.user.name, { x: 64, y: height - 246, size: nameSize, font: serif, color: INK });

  page.drawText("has completed, with all assessments passed,", { x: 64, y: height - 282, size: 13, font: serifItalic, color: MUTED });

  const titleSize = cert.course.title.length > 40 ? 20 : 26;
  page.drawText(cert.course.title, { x: 64, y: height - 318, size: titleSize, font: serif, color: JADE });
  page.drawText(cert.course.subtitle, { x: 64, y: height - 338, size: 11, font: sans, color: MUTED });

  const facts: [string, string][] = [
    ["Grade", cert.grade ?? "Pass"],
    ["Effort", `${cert.course.durationHours} hours`],
    ["Issued", formatLong(cert.issuedAt)],
    ["Instructor", cert.course.instructor.name],
  ];
  let fx = 64;
  for (const [label, value] of facts) {
    page.drawText(label.toUpperCase(), { x: fx, y: 150, size: 7, font: sansBold, color: MUTED });
    page.drawText(value, { x: fx, y: 136, size: 10.5, font: sans, color: INK });
    fx += 150;
  }

  page.drawLine({ start: { x: 64, y: 108 }, end: { x: 260, y: 108 }, thickness: 0.8, color: INK });
  page.drawText("Dr. Ayesha Rehman", { x: 64, y: 94, size: 10, font: sans, color: INK });
  page.drawText("Dean of the Academy", { x: 64, y: 82, size: 8, font: sans, color: MUTED });

  page.drawText("Verify this certificate", { x: 64, y: 58, size: 7.5, font: sansBold, color: MUTED });
  page.drawText(verifyUrl, { x: 64, y: 47, size: 8, font: sans, color: JADE });

  const qr = await pdf.embedPng(qrPng);
  page.drawImage(qr, { x: width - 64 - 110, y: 64, width: 110, height: 110 });
  page.drawText(cert.code, { x: width - 64 - 110, y: 50, size: 8, font: sans, color: MUTED });

  page.drawCircle({ x: width - 120, y: height - 130, size: 34, borderColor: GOLD, borderWidth: 1.2 });
  page.drawCircle({ x: width - 120, y: height - 130, size: 27, borderColor: GOLD, borderWidth: 0.6 });
  page.drawText("EST. 2024", { x: width - 141, y: height - 134, size: 7.5, font: sansBold, color: GOLD });

  const bytes = await pdf.save();
  const filename = `PIOAI-certificate-${cert.code}.pdf`;
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
