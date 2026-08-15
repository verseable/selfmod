import { ImageResponse } from "next/og";
import { SERVER_NAME } from "./questions";

export const runtime = "edge";
export const alt = `Moderator Application for ${SERVER_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          color: "#ededee",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 34,
            backgroundColor: "#f4f4f5",
            marginBottom: 44,
          }}
        >
          <svg width="82" height="82" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="#0a0a0b"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          Moderator Application
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 36,
            color: "#9b9ba1",
          }}
        >
          {`Apply to join the ${SERVER_NAME} staff team`}
        </div>
      </div>
    ),
    { ...size }
  );
}
