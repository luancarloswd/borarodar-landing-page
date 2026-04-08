import { NextRequest, NextResponse } from "next/server";
import { DOMParser } from "@xmldom/xmldom";
import { kml } from "@tmcw/togeojson";
import JSZip from "jszip";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "application/vnd.google-earth.kml+xml",
  "application/vnd.google-earth.kmz",
  "application/xml",
  "text/xml",
  "application/octet-stream",
  "application/zip",
];
const KML_EXTENSIONS = [".kml"];
const KMZ_EXTENSIONS = [".kmz"];

function parseKmlString(kmlString: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(kmlString, "text/xml");

  const parseErrors = doc.getElementsByTagName("parsererror");
  if (parseErrors.length > 0) {
    throw new Error("Invalid KML: XML parsing failed");
  }

  const geojson = kml(doc);

  if (!geojson.features || geojson.features.length === 0) {
    throw new Error("No features found in KML file");
  }

  return geojson;
}

async function extractKmlFromKmz(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);

  // KMZ files contain a doc.kml at root, or any .kml file
  let kmlFile = zip.file("doc.kml");

  if (!kmlFile) {
    // Search for any .kml file in the archive
    const kmlFiles = zip.file(/\.kml$/i);
    if (kmlFiles.length === 0) {
      throw new Error("No KML file found inside KMZ archive");
    }
    kmlFile = kmlFiles[0];
  }

  return kmlFile.async("text");
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.substring(lastDot).toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "No file provided. Send a file with the field name 'file'" },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "File is empty" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    const extension = getFileExtension(file.name);
    const isKml = KML_EXTENSIONS.includes(extension);
    const isKmz = KMZ_EXTENSIONS.includes(extension);

    if (!isKml && !isKmz) {
      // Fall back to MIME type check
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Accepted formats: .kml, .kmz" },
          { status: 400 }
        );
      }
    }

    let kmlString: string;

    if (isKmz || file.type === "application/vnd.google-earth.kmz" || file.type === "application/zip") {
      const buffer = await file.arrayBuffer();
      kmlString = await extractKmlFromKmz(buffer);
    } else {
      kmlString = await file.text();
    }

    const geojson = parseKmlString(kmlString);

    return NextResponse.json({
      type: geojson.type,
      features: geojson.features,
      metadata: {
        filename: file.name,
        featureCount: geojson.features.length,
        importedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process file";

    if (
      message.includes("Invalid KML") ||
      message.includes("No features found") ||
      message.includes("No KML file found")
    ) {
      return NextResponse.json({ error: message }, { status: 422 });
    }

    console.error("KML import error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
