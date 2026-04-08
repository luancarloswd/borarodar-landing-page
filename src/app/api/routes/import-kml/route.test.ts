import { File as NodeFile } from "node:buffer";
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import JSZip from "jszip";
import { POST } from "./route";

// Polyfill File for Node 18 (global File added in Node 20)
if (typeof globalThis.File === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).File = NodeFile;
}

const VALID_KML = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Test Route</name>
    <Placemark>
      <name>Test Point</name>
      <Point>
        <coordinates>-43.1729,-22.9068,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;

const VALID_KML_LINESTRING = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Test Route</name>
    <Placemark>
      <name>Route Segment</name>
      <LineString>
        <coordinates>
          -43.1729,-22.9068,0
          -43.1800,-22.9100,0
          -43.1850,-22.9150,0
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;

const KML_NO_FEATURES = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Empty</name>
  </Document>
</kml>`;

const INVALID_XML = `<not valid xml <<>>>>>`;

function createFileRequest(
  file: File,
  contentType = "multipart/form-data"
): NextRequest {
  const formData = new FormData();
  formData.append("file", file);

  const request = new NextRequest("http://localhost/api/routes/import-kml", {
    method: "POST",
    body: formData,
  });

  // Override content-type header if needed (NextRequest auto-sets it for FormData)
  if (contentType !== "multipart/form-data") {
    // For non-formdata content types, create a plain request
    return new NextRequest("http://localhost/api/routes/import-kml", {
      method: "POST",
      body: "not form data",
      headers: { "content-type": contentType },
    });
  }

  return request;
}

function createKmlFile(
  content: string,
  filename = "route.kml",
  type = "application/vnd.google-earth.kml+xml"
): File {
  return new File([content], filename, { type });
}

async function createKmzBuffer(kmlContent: string, kmlFilename = "doc.kml"): Promise<Uint8Array> {
  const zip = new JSZip();
  zip.file(kmlFilename, kmlContent);
  return zip.generateAsync({ type: "uint8array" });
}

describe("POST /api/routes/import-kml", () => {
  describe("request validation", () => {
    it("returns 400 when Content-Type is not multipart/form-data", async () => {
      const request = new NextRequest(
        "http://localhost/api/routes/import-kml",
        {
          method: "POST",
          body: "{}",
          headers: { "content-type": "application/json" },
        }
      );

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("multipart/form-data");
    });

    it("returns 400 when no file is provided", async () => {
      const formData = new FormData();
      const request = new NextRequest(
        "http://localhost/api/routes/import-kml",
        {
          method: "POST",
          body: formData,
        }
      );

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("No file provided");
    });

    it("returns 400 when file field is a string instead of a file", async () => {
      const formData = new FormData();
      formData.append("file", "not a file");
      const request = new NextRequest(
        "http://localhost/api/routes/import-kml",
        {
          method: "POST",
          body: formData,
        }
      );

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("No file provided");
    });

    it("returns 400 when file is empty", async () => {
      const file = createKmlFile("", "empty.kml");
      const request = createFileRequest(file);

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("empty");
    });

    it("returns 400 for invalid file extension and MIME type", async () => {
      const file = new File(["some content"], "data.txt", {
        type: "text/plain",
      });
      const formData = new FormData();
      formData.append("file", file);
      const request = new NextRequest(
        "http://localhost/api/routes/import-kml",
        {
          method: "POST",
          body: formData,
        }
      );

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("Invalid file type");
    });
  });

  describe("KML parsing", () => {
    it("parses a valid KML file with a Point", async () => {
      const file = createKmlFile(VALID_KML, "route.kml");
      const request = createFileRequest(file);

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.type).toBe("FeatureCollection");
      expect(body.features).toHaveLength(1);
      expect(body.features[0].geometry.type).toBe("Point");
      expect(body.features[0].geometry.coordinates).toEqual([-43.1729, -22.9068, 0]);
      expect(body.metadata.filename).toBe("route.kml");
      expect(body.metadata.featureCount).toBe(1);
      expect(body.metadata.importedAt).toBeDefined();
    });

    it("parses a valid KML file with a LineString", async () => {
      const file = createKmlFile(VALID_KML_LINESTRING, "route.kml");
      const request = createFileRequest(file);

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.type).toBe("FeatureCollection");
      expect(body.features).toHaveLength(1);
      expect(body.features[0].geometry.type).toBe("LineString");
      expect(body.features[0].geometry.coordinates).toHaveLength(3);
    });

    it("accepts KML with application/xml MIME type", async () => {
      const file = new File([VALID_KML], "route.xml", {
        type: "application/xml",
      });
      const formData = new FormData();
      formData.append("file", file);
      const request = new NextRequest(
        "http://localhost/api/routes/import-kml",
        {
          method: "POST",
          body: formData,
        }
      );

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.type).toBe("FeatureCollection");
    });

    it("returns 422 for KML with no features", async () => {
      const file = createKmlFile(KML_NO_FEATURES, "empty.kml");
      const request = createFileRequest(file);

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body.error).toContain("No features found");
    });
  });

  describe("KMZ parsing", () => {
    it("parses a valid KMZ file with doc.kml", async () => {
      const kmzBuffer = await createKmzBuffer(VALID_KML);
      const file = new File([kmzBuffer], "route.kmz", {
        type: "application/vnd.google-earth.kmz",
      });
      const formData = new FormData();
      formData.append("file", file);
      const request = new NextRequest(
        "http://localhost/api/routes/import-kml",
        {
          method: "POST",
          body: formData,
        }
      );

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.type).toBe("FeatureCollection");
      expect(body.features).toHaveLength(1);
      expect(body.metadata.filename).toBe("route.kmz");
    });

    it("parses KMZ with non-standard KML filename", async () => {
      const kmzBuffer = await createKmzBuffer(VALID_KML, "custom-route.kml");
      const file = new File([kmzBuffer], "route.kmz", {
        type: "application/vnd.google-earth.kmz",
      });
      const formData = new FormData();
      formData.append("file", file);
      const request = new NextRequest(
        "http://localhost/api/routes/import-kml",
        {
          method: "POST",
          body: formData,
        }
      );

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.type).toBe("FeatureCollection");
    });

    it("returns 422 for KMZ with no KML inside", async () => {
      const zip = new JSZip();
      zip.file("readme.txt", "no kml here");
      const buffer = await zip.generateAsync({ type: "uint8array" });
      const file = new File([buffer], "bad.kmz", {
        type: "application/vnd.google-earth.kmz",
      });
      const formData = new FormData();
      formData.append("file", file);
      const request = new NextRequest(
        "http://localhost/api/routes/import-kml",
        {
          method: "POST",
          body: formData,
        }
      );

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(422);
      expect(body.error).toContain("No KML file found");
    });

    it("detects KMZ by .kmz extension even with generic MIME type", async () => {
      const kmzBuffer = await createKmzBuffer(VALID_KML);
      const file = new File([kmzBuffer], "route.kmz", {
        type: "application/octet-stream",
      });
      const formData = new FormData();
      formData.append("file", file);
      const request = new NextRequest(
        "http://localhost/api/routes/import-kml",
        {
          method: "POST",
          body: formData,
        }
      );

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.type).toBe("FeatureCollection");
    });
  });

  describe("multiple features", () => {
    it("handles KML with multiple placemarks", async () => {
      const multiKml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Multi Route</name>
    <Placemark>
      <name>Start</name>
      <Point><coordinates>-43.17,-22.90,0</coordinates></Point>
    </Placemark>
    <Placemark>
      <name>Middle</name>
      <Point><coordinates>-43.18,-22.91,0</coordinates></Point>
    </Placemark>
    <Placemark>
      <name>End</name>
      <Point><coordinates>-43.19,-22.92,0</coordinates></Point>
    </Placemark>
  </Document>
</kml>`;

      const file = createKmlFile(multiKml, "multi.kml");
      const request = createFileRequest(file);

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.features).toHaveLength(3);
      expect(body.metadata.featureCount).toBe(3);
    });
  });
});
