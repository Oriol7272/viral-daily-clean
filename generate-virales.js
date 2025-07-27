equire('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { ApifyClient } = require('apify-client');

const apifyToken = process.env.APIFY_TOKEN;
const youtubeKey = process.env.YOUTUBE_KEY;

function todayDate() {
  const d = new Date();
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

async function getTrendingYouTubeVideos() {
  const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=10&regionCode=ES&key=${youtubeKey}`;
  const response = await axios.get(url);
  return response.data.items.map(video => ({
    title: video.snippet.title,
    views: video.statistics.viewCount,
    thumbnail: video.snippet.thumbnails.default.url,
    link: `https://www.youtube.com/watch?v=${video.id}`
  }));
}

async function getTrendingTikTokVideos() {
  const client = new ApifyClient({ token: apifyToken });
  const { id: actorTaskId } = await client.actor("medvas/tiktok-trending-videos").call({
    country: "ES",
    maxItems: 10
  });
  const { items } = await client.dataset(actorTaskId).listItems();
  return items.map(video => ({
    title: video.desc,
    views: video.stats.playCount,
    thumbnail: video.video.cover,
    link: video.shareUrl
  }));
}

function generateHTML(youtubeVideos, tiktokVideos) {
  const html = `
<!DOCTYPE html><html><head><title>Top 10 Virales</title>
<style>
body { font-family: Arial, sans-serif; margin: 20px; }
h1 { text-align: center; }
h2 { margin-top: 30px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
img { width: 150px; height: auto; }
a { color: #007bff; text-decoration: none; }
a:hover { text-decoration: underline; }
</style></head><body>
<h1>Top 10 Virales - ${todayDate()}</h1>

<h2>YouTube</h2>
<table><tr><th>Title</th><th>Views</th><th>Thumbnail</th><th>Link</th></tr>
${youtubeVideos.map(v => `<tr><td>${v.title}</td><td>${v.views}</td><td><img src="${v.thumbnail}"></td><td><a href="${v.link}">Ver</a></td></tr>`).join("")}
</table>

<h2>TikTok</h2>
<table><tr><th>Title</th><th>Views</th><th>Thumbnail</th><th>Link</th></tr>
${tiktokVideos.map(v => `<tr><td>${v.title}</td><td>${v.views}</td><td><img src="${v.thumbnail}"></td><td><a href="${v.link}">Ver</a></td></tr>`).join("")}
</table>

</body></html>`;
  fs.writeFileSync("index.html", html);
}

(async () => {
  console.log("Obteniendo vídeos virales de YouTube y TikTok...");
  const [youtube, tiktok] = await Promise.all([
    getTrendingYouTubeVideos(),
    getTrendingTikTokVideos()
  ]);
  generateHTML(youtube, tiktok);
  console.log("✅ index.html generado con éxito.");
})();
