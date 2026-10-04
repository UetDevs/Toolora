import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["pdfjs-dist"],
  async redirects() {
    return [
      { source: "/paraphrasing-tool", destination: "/tools/writing/paraphrasing-tool", permanent: true },
      { source: "/sentence-rewriter", destination: "/tools/writing/sentence-rewriter", permanent: true },
      { source: "/grammar-checker", destination: "/tools/writing/grammar-checker", permanent: true },
      { source: "/summarizer", destination: "/tools/writing/summarizer", permanent: true },
      { source: "/word-counter", destination: "/tools/writing/word-counter", permanent: true },
      { source: "/tools/developer-tools/word-counter", destination: "/tools/writing/word-counter", permanent: true },
      { source: "/image-resizer", destination: "/tools/image-tools/image-resizer", permanent: true },
      { source: "/image-compressor", destination: "/tools/image-tools/image-compressor", permanent: true },
      { source: "/image-cropper", destination: "/tools/image-tools/image-cropper", permanent: true },
      { source: "/favicon-generator", destination: "/tools/image-tools/favicon-generator", permanent: true },
      { source: "/tools/data-tools/json-formatter", destination: "/tools/developer-tools/json-formatter", permanent: true },
      { source: "/json-formatter", destination: "/tools/developer-tools/json-formatter", permanent: true },
      { source: "/regex-tester", destination: "/tools/developer-tools/regex-tester", permanent: true },
      { source: "/jwt-decoder", destination: "/tools/developer-tools/jwt-decoder", permanent: true },
      { source: "/pdf-to-jpg", destination: "/tools/file-converters/pdf-to-jpg", permanent: true },
      { source: "/jpg-to-pdf", destination: "/tools/file-converters/jpg-to-pdf", permanent: true },
      { source: "/word-to-pdf", destination: "/tools/file-converters/word-to-pdf", permanent: true },
      { source: "/pdf-to-word", destination: "/tools/file-converters/pdf-to-word", permanent: true },
      { source: "/tools/video-tools", destination: "/tools/media-tools", permanent: true },
      { source: "/tools/video-tools/:path*", destination: "/tools/media-tools/:path*", permanent: true },
      { source: "/video-compressor", destination: "/tools/media-tools/video-compressor", permanent: true },
      { source: "/video-resizer", destination: "/tools/media-tools/video-resizer", permanent: true },
      { source: "/video-to-gif", destination: "/tools/media-tools/video-to-gif", permanent: true },
      { source: "/kg-to-lbs", destination: "/tools/unit-converters/kg-to-lbs", permanent: true },
      { source: "/lbs-to-kg", destination: "/tools/unit-converters/lbs-to-kg", permanent: true },
      { source: "/cm-to-inches", destination: "/tools/unit-converters/cm-to-inches", permanent: true },
      { source: "/celsius-to-fahrenheit", destination: "/tools/unit-converters/celsius-to-fahrenheit", permanent: true },
      { source: "/qr-code-generator", destination: "/tools/developer-tools/qr-code-generator", permanent: true },
      { source: "/password-generator", destination: "/tools/developer-tools/password-generator", permanent: true },
      { source: "/merge-pdf", destination: "/tools/file-converters/merge-pdf", permanent: true },
      { source: "/compress-pdf", destination: "/tools/file-converters/compress-pdf", permanent: true },
      { source: "/split-pdf", destination: "/tools/file-converters/split-pdf", permanent: true },
      { source: "/heic-to-jpg", destination: "/tools/image-tools/heic-to-jpg", permanent: true },
      { source: "/mortgage-calculator", destination: "/tools/calculators/mortgage-calculator", permanent: true },
      { source: "/gst-calculator", destination: "/tools/calculators/gst-calculator", permanent: true },
    ];
  },
};

export default nextConfig;
