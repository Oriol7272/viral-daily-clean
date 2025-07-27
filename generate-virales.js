require("dotenv").config();
const fs = require("fs");
const { google } = require("googleapis");
const { ApifyClient } = require("apify-client");

const apifyToken = process.env.APIFY_TOKEN;
const client = new ApifyClient({ token: apifyToken });

async function getTrendingYouTubeVideos() {
  const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
  });

  const res = await youtube.videos.list({
    part: "snippet,statistics",
    chart: "mostPopular",
    regionCode: "ES",
    maxResults: 5,
  });

  return res.data.items.map((video) => ({
    title: video.snippet.title,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnail: video.snippet.thumbnails.high.url,
    views: video.statistics.viewCount,
    platform: "YouTube",
  }));
}

async function getTrendingTikTokVideos() {
  const run = await client.actor("apify/tiktok-scraper").call({
    input: {
      startUrls: [{ url: "https://www.tiktok.com/foryou" }],
      maxResults: 10,
    },
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  return items.map((item) => ({
    title: item.text || "TikTok Video",
    url: item.videoUrl,
    thumbnail: item.cover || item.videoThumb || "",
    views: item.diggCount,
    platform: "TikTok",
  }));
}

(async () => {
  console.log("Obteniendo vídeos virales de YouTube y TikTok...");
  try {
    const [youtubeVideos, tiktokVideos] = await Promise.all([
      getTrendingYouTubeVideos(),
      getTrendingTikTokVideos(),
    ]);

    const allVideos = [...youtubeVideos, ...tiktokVideos]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    fs.writeFileSync("public/virales.json", JSON.stringify(allVideos, null, 2));
    console.log("✅ Archivo virales.json generado con éxito.");
  } catch (error) {
    console.error("❌ Error generando vídeos virales:", error);
    process.exit(1);
  }
})();

