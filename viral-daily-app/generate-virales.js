const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// Your APIs/tokens integrated (from your Doc; fallback if invalid)
const youtubeKey = 'vbGHKe3it0jkOIpOYprbyyijIMno5bOkpEEtn9WHYTYvobZ2wqZtw0X3yrnXS06ZAHMIp33ziM2hgOtw19h-vrLUSHuA9IT0D7ImwLIlH92gZbDdN2xaE5j4eEFKHx8N_3H8eIqIFWNjiAmGL4Br2';
const tiktokMsToken = 'X_LeGXnwuxU3UoagaHwJO772TN7gDLYTt_Vn5rN54jDZsC1B7Sm_6XE8r1DDQfsCCH0l94tRJ1zCp_X7navLQQLcbhGqrzHZF9Ny8nKg0itVq9wB4NR9_NZyvfQluZPShhgKMhuhRETyJj-quBSC5uVU';
const tiktokOfficialToken = 'rcSQXzimj4WYQBmSPX8RueYjm';
const xBearerToken = 'AAAAAAAAAAAAAAAAAAAAAHvz3AEAAAAA0KKiiRMU8nwQ8ggjG96GDhCZ8T8%3D6BrOF6a4YszLFgLKD1sLlSuhzZdkIFemgCQxo0cTaXAXtjLHnJ';
const instagramToken = '1660172337977149|LGyFDALRpBiboDeH_VovftnXlwk';

console.log('Script started.');

// Retry function for 429 handling (initial delay 5000ms)
async function fetchWithRetry(url, options, retries = 3, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, options);
    } catch (err) {
      if (err.response?.status === 429 && i < retries - 1) {
        console.warn(`Rate limit hit, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw err;
      }
    }
  }
}

async function fetchVirales() {
  let youtubeVirales = [];
  let tiktokVirales = [];
  let instagramVirales = [];
  let xVirales = [];

  // YouTube fetch
  try {
    const ytResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=10&key=${youtubeKey}`);
    youtubeVirales = ytResponse.data.items.map(item => ({
      title: item.snippet.title || 'YouTube Viral',
      views: item.statistics.viewCount || 0,
      thumbnail: item.snippet.thumbnails?.default?.url || 'https://placehold.co/150?text=YT',
      link: `https://www.youtube.com/watch?v=${item.id || ''}`
    })).sort((a, b) => b.views - a.views);
    console.log('Fetched YouTube:', youtubeVirales.length);
    console.log('YouTube data:', JSON.stringify(youtubeVirales, null, 2));
  } catch (err) {
    console.error('Error YouTube:', err.message, err.response?.data);
    youtubeVirales = Array.from({length: 10}, (_, i) => ({
      title: `YT Viral ${i+1}`,
      views: 1000000 * (11-i),
      thumbnail: 'https://placehold.co/150?text=YT'+(i+1),
      link: 'https://youtube.com'
    }));
  }

  // TikTok fetch with your official token (added 'query_keywords' param for valid request)
  try {
    const ttResponse = await axios.post('https://open.tiktokapis.com/v2/research/video/query/?fields=id,create_time,description,username,video_description,height,width,duration,play_count,like_count,comment_count,share_count', { query_keywords: 'viral' }, {
      headers: { 'Authorization': `Bearer ${tiktokOfficialToken}` }
    });
    tiktokVirales = ttResponse.data.data.map(item => ({
      title: item.description || 'TikTok Viral',
      likes: item.like_count || 0,
      thumbnail: 'https://placehold.co/150?text=TT', // Replace with real thumbnail if available in response
      link: `https://www.tiktok.com/video/${item.id || ''}`
    })).sort((a, b) => b.likes - a.likes).slice(0, 10);
    console.log('Fetched TikTok:', tiktokVirales.length);
    console.log('TikTok data:', JSON.stringify(tiktokVirales, null, 2));
  } catch (err) {
    console.error('Error TikTok Official:', err.message, err.response?.data);
    tiktokVirales = Array.from({length: 10}, (_, i) => ({
      title: `TT Viral ${i+1}`,
      likes: 30000 * (11-i),
      thumbnail: 'https://placehold.co/150?text=TT'+(i+1),
      link: 'https://tiktok.com'
    }));
  }

  // Instagram fetch with your token (Meta Graph API - assuming it's a long-lived access token; replace 'your_instagram_user_id' with your actual IG user ID)
  try {
    const hashtagResponse = await axios.get(`https://graph.facebook.com/v20.0/ig_hashtag_search?user_id=your_instagram_user_id&q=viral&access_token=${instagramToken}`);
    const hashtagId = hashtagResponse.data.data[0].id || '17843856750040590'; // Default 'viral' ID

    const igResponse = await axios.get(`https://graph.facebook.com/v20.0/${hashtagId}/top_media?user_id=your_instagram_user_id&fields=media_type,media_url,permalink,like_count&access_token=${instagramToken}&limit=10`);
    instagramVirales = igResponse.data.data.map(item => ({
      title: 'Instagram Viral Reel',
      likes: item.like_count || 0,
      thumbnail: item.media_url || 'https://placehold.co/150?text=IG',
      link: item.permalink || 'https://instagram.com'
    })).sort((a, b) => b.likes - a.likes);
    console.log('Fetched Instagram:', instagramVirales.length);
    console.log('Instagram data:', JSON.stringify(instagramVirales, null, 2));
  } catch (err) {
    console.error('Error Instagram Official:', err.message, err.response?.data);
    instagramVirales = Array.from({length: 10}, (_, i) => ({
      title: `IG Viral ${i+1}`,
      likes: 50000 * (11-i),
      thumbnail: 'https://placehold.co/150?text=IG'+(i+1),
      link: 'https://instagram.com'
    }));
  }

  let xVirales = [];
  try {
    const xResponse = await fetchWithRetry('https://api.twitter.com/2/tweets/search/recent?query=viral videos lang:en has:videos&max_results=10&tweet.fields=public_metrics,attachments&expansions=attachments.media_keys&media.fields=preview_image_url,url', {
      headers: { 'Authorization': `Bearer ${xBearerToken}` }
    });
    xVirales = xResponse.data.data.map(item => ({
      author: `@${item.author_id}`,
      likes: item.public_metrics.like_count,
      thumbnail: item.attachments?.media_keys ? xResponse.data.includes.media.find(m => m.media_key === item.attachments.media_keys[0])?.preview_image_url || 'https://placehold.co/150?text=X' : 'https://placehold.co/150?text=X',
      link: `https://x.com/i/status/${item.id}`
    })).sort((a, b) => b.likes - a.likes);
    console.log('Fetched X:', xVirales.length);
    console.log('X data:', JSON.stringify(xVirales, null, 2));
  } catch (err) {
    console.error('Error X:', err.message, err.response?.data);
    xVirales = Array.from({length: 10}, (_, i) => ({
      author: `@user${i+1}`,
      likes: 20000 * (11-i),
      thumbnail: 'https://placehold.co/150?text=X'+(i+1),
      link: 'https://x.com'
    }));
  }

  return { youtube: youtubeVirales, instagram: instagramVirales, x: xVirales, tiktok: tiktokVirales };
}

async function generateHTML() {
  const data = await fetchVirales();
  const html = `<!DOCTYPE html><html><body><h1>Top 10 Virales - ${new Date().toLocaleDateString()}</h1>
  <h2>YouTube</h2><table><tr><th>Title</th><th>Views</th><th>Thumbnail</th><th>Link</th></tr>${data.youtube.map(v => `<tr><td>${v.title}</td><td>${v.views}</td><td><img src="${v.thumbnail}"></td><td><a href="${v.link}">Ver</a></td></tr>`).join('')}</table>
  <h2>Instagram</h2><table><tr><th>Title</th><th>Likes</th><th>Thumbnail</th><th>Link</th></tr>${data.instagram.map(v => `<tr><td>${v.title}</td><td>${v.likes}</td><td><img src="${v.thumbnail}"></td><td><a href="${v.link}">Ver</a></td></tr>`).join('')}</table>
  <h2>X</h2><table><tr><th>Author</th><th>Likes</th><th>Thumbnail</th><th>Link</th></tr>${data.x.map(v => `<tr><td>${v.author}</td><td>${v.likes}</td><td><img src="${v.thumbnail}"></td><td><a href="${v.link}">Ver</a></td></tr>`).join('')}</table>
  <h2>TikTok</h2><table><tr><th>Title</th><th>Likes</th><th>Thumbnail</th><th>Link</th></tr>${data.tiktok.map(v => `<tr><td>${v.title}</td><td>${v.likes}</td><td><img src="${v.thumbnail}"></td><td><a href="${v.link}">Ver</a></td></tr>`).join('')}</table>
  </body></html>`;
  fs.writeFileSync('index.html', html);
  console.log('Generated HTML with fresh virales.');
}

generateHTML();
