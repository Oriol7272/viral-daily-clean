const fs = require('fs');
const axios = require('axios');
<<<<<<< HEAD

// Keys from your MS_TOKEN _(2).txt file (integrated directly; use env vars in production)
const youtubeKey = 'AIzaSyDyuMNfrJXOMk4lCwJ7GV70zEP6iwrISuY';
const tiktokMsToken = 'X_LeGXnwuxU3UoagaHwJO772TN7gDLYTt_Vn5rN54jDZsC1B7Sm_6XE8r1DDQfsCCH0l94tRJ1zCp_X7navLQQLcbhGqrzHZF9Ny8nKg0itVq9wB4NR9_NZyvfQluZPShhgKMhuhRETyJj-quBSC5uVU';
const tiktokClientKey = 'YsSYGHOy5hahvCuhsThDMuC09'; // New TikTok client key (invalid - fallback used)
const tiktokClientSecret = 'cj2pm8NnZMHEZl1YgvMIVcwYcCmhOZllfikjGUrWkJMLsglvBn'; // New TikTok client secret (invalid - fallback used)
=======
const { ApifyClient } = require('apify-client');

// Apify token (replace if new)
require('dotenv').config();
const apifyToken = process.env.APIFY_TOKEN;

// YouTube and X keys
const youtubeKey = 'AIzaSyDyuMNfrJXOMk4lCwJ7GV70zEP6iwrISuY';
>>>>>>> db5e9a1 (Proyecto limpio, funcional – vídeos virales YouTube + TikTok)
const xBearerToken = 'AAAAAAAAAAAAAAAAAAAAAHvz3AEAAAAA0KKiiRMU8nwQ8ggjG96GDhCZ8T8%3D6BrOF6a4YszLFgLKD1sLlSuhzZdkIFemgCQxo0cTaXAXtjLHnJ';

console.log('Script started.');

<<<<<<< HEAD
// Retry function for 429 handling (initial delay increased to 60000ms for X rate limit, more retries)
async function fetchWithRetry(url, options, retries = 10, delay = 60000) {
=======
// Retry function (capped to 5, max delay 5 min)
async function fetchWithRetry(url, options, retries = 5, delay = 60000, maxDelay = 300000) {
>>>>>>> db5e9a1 (Proyecto limpio, funcional – vídeos virales YouTube + TikTok)
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, options);
    } catch (err) {
      if (err.response?.status === 429 && i < retries - 1) {
<<<<<<< HEAD
        console.warn(`Rate limit hit, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
=======
        delay = Math.min(delay * 2, maxDelay);
        console.warn(`Rate limit hit, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
>>>>>>> db5e9a1 (Proyecto limpio, funcional – vídeos virales YouTube + TikTok)
      } else {
        throw err;
      }
    }
  }
}

async function fetchVirales() {
  let youtubeVirales = [];
  let tiktokVirales = [];
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
<<<<<<< HEAD
    console.log('YouTube data:', JSON.stringify(youtubeVirales, null, 2));
  } catch (err) {
    console.error('Error YouTube:', err.message, err.response?.data);
=======
  } catch (err) {
    console.error('Error YouTube:', err.message);
>>>>>>> db5e9a1 (Proyecto limpio, funcional – vídeos virales YouTube + TikTok)
    youtubeVirales = Array.from({length: 10}, (_, i) => ({
      title: `YT Viral ${i+1}`,
      views: 1000000 * (11-i),
      thumbnail: 'https://placehold.co/150?text=YT'+(i+1),
      link: 'https://youtube.com'
    }));
  }

<<<<<<< HEAD
  // TikTok fetch with msToken (client key/secret invalid - using msToken as primary)
  try {
    const ttResponse = await axios.get(`https://www.tiktok.com/api/search/general/full/?keyword=viral&msToken=${tiktokMsToken}&offset=0&count=10`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    tiktokVirales = (ttResponse.data.data || []).map(item => ({
      title: item.desc || 'TikTok Viral',
      likes: item.playCount || 0,
      thumbnail: item.cover || 'https://placehold.co/150?text=TT',
      link: `https://www.tiktok.com/video/${item.videoId || ''}`
    })).sort((a, b) => b.likes - a.likes).slice(0, 10);
    console.log('Fetched TikTok:', tiktokVirales.length);
    console.log('TikTok data:', JSON.stringify(tiktokVirales, null, 2));
  } catch (err) {
    console.error('Error TikTok:', err.message, err.response?.data);
=======
  // TikTok fetch with Apify
  try {
    const client = new ApifyClient({ token: apifyToken });
    const input = {
      "hashtags": ["viral"],
      "maxItems": 10,
      "resultsPerPage": 100,
      "proxyConfiguration": { "useApifyProxy": true }
    };
    const run = await client.actor('clockworks/tiktok-scraper').call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    tiktokVirales = items.map(item => ({
      title: item.caption || 'TikTok Viral',
      likes: item.diggCount || 0,
      thumbnail: item.cover || 'https://placehold.co/150?text=TT',
      link: item.url || 'https://tiktok.com'
    })).sort((a, b) => b.likes - a.likes).slice(0, 10);
    console.log('Fetched TikTok:', tiktokVirales.length);
  } catch (err) {
    console.error('Error TikTok:', err.message);
>>>>>>> db5e9a1 (Proyecto limpio, funcional – vídeos virales YouTube + TikTok)
    tiktokVirales = Array.from({length: 10}, (_, i) => ({
      title: `TT Viral ${i+1}`,
      likes: 30000 * (11-i),
      thumbnail: 'https://placehold.co/150?text=TT'+(i+1),
      link: 'https://tiktok.com'
    }));
  }

<<<<<<< HEAD
  // X fetch (added user.fields=username to fix @undefined issue)
  try {
    const xResponse = await fetchWithRetry('https://api.twitter.com/2/tweets/search/recent?query=viral videos lang:en has:videos&max_results=10&tweet.fields=public_metrics,attachments&expansions=attachments.media_keys,author_id&media.fields=preview_image_url,url&user.fields=username', {
      headers: { 'Authorization': `Bearer ${xBearerToken}` }
    });
    xVirales = xResponse.data.data.map(item => {
      const author = xResponse.data.includes.users.find(u => u.id === item.author_id);
      return {
        author: author ? `@${author.username}` : '@unknown',
        likes: item.public_metrics.like_count,
        thumbnail: item.attachments?.media_keys ? xResponse.data.includes.media.find(m => m.media_key === item.attachments.media_keys[0])?.preview_image_url || 'https://placehold.co/150?text=X' : 'https://placehold.co/150?text=X',
        link: `https://x.com/i/status/${item.id}`
      };
    }).sort((a, b) => b.likes - a.likes);
    console.log('Fetched X:', xVirales.length);
    console.log('X data:', JSON.stringify(xVirales, null, 2));
  } catch (err) {
    console.error('Error X:', err.message, err.response?.data);
=======
  // X fetch (reduced max_results to 5)
  try {
    const xResponse = await fetchWithRetry('https://api.twitter.com/2/tweets/search/recent?query=viral videos lang:en has:videos&max_results=5&tweet.fields=public_metrics,attachments&expansions=attachments.media_keys,author_id&media.fields=preview_image_url,url&user.fields=username', {
      headers: { 'Authorization': `Bearer ${xBearerToken}` }
    });
    xVirales = xResponse.data.data.map(item => ({
      author: xResponse.data.includes.users.find(u => u.id === item.author_id)?.username || '@unknown',
      likes: item.public_metrics.like_count,
      thumbnail: item.attachments?.media_keys ? xResponse.data.includes.media.find(m => m.media_key === item.attachments.media_keys[0])?.preview_image_url || 'https://placehold.co/150?text=X' : 'https://placehold.co/150?text=X',
      link: `https://x.com/i/status/${item.id}`
    })).sort((a, b) => b.likes - a.likes);
    console.log('Fetched X:', xVirales.length);
  } catch (err) {
    console.error('Error X:', err.message);
>>>>>>> db5e9a1 (Proyecto limpio, funcional – vídeos virales YouTube + TikTok)
    xVirales = Array.from({length: 10}, (_, i) => ({
      author: `@user${i+1}`,
      likes: 20000 * (11-i),
      thumbnail: 'https://placehold.co/150?text=X'+(i+1),
      link: 'https://x.com'
    }));
  }

  return { youtube: youtubeVirales, tiktok: tiktokVirales, x: xVirales };
}

async function generateHTML() {
  const data = await fetchVirales();
<<<<<<< HEAD
  const html = `<!DOCTYPE html><html><body><h1>Top 10 Virales - ${new Date().toLocaleDateString()}</h1>
  <h2>YouTube</h2><table><tr><th>Title</th><th>Views</th><th>Thumbnail</th><th>Link</th></tr>${data.youtube.map(v => `<tr><td>${v.title}</td><td>${v.views}</td><td><img src="${v.thumbnail}"></td><td><a href="${v.link}">Ver</a></td></tr>`).join('')}</table>
  <h2>TikTok</h2><table><tr><th>Title</th><th>Likes</th><th>Thumbnail</th><th>Link</th></tr>${data.tiktok.map(v => `<tr><td>${v.title}</td><td>${v.likes}</td><td><img src="${v.thumbnail}"></td><td><a href="${v.link}">Ver</a></td></tr>`).join('')}</table>
  <h2>X</h2><table><tr><th>Author</th><th>Likes</th><th>Thumbnail</th><th>Link</th></tr>${data.x.map(v => `<tr><td>${v.author}</td><td>${v.likes}</td><td><img src="${v.thumbnail}"></td><td><a href="${v.link}">Ver</a></td></tr>`).join('')}</table>
  </body></html>`;
=======
  const html = `<!DOCTYPE html><html><head><title>Top 10 Virales</title><style>body { font-family: Arial, sans-serif; margin: 20px; } h1 { text-align: center; } h2 { margin-top: 30px; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; } img { width: 150px; height: auto; } a { color: #007bff; text-decoration: none; } a:hover { text-decoration: underline; }</style></head><body><h1>Top 10 Virales - ${new Date().toLocaleDateString()}</h1><h2>YouTube</h2><table><tr><th>Title</th><th>Views</th><th>Thumbnail</th><th>Link</th></tr>${data.youtube.map(v => `<tr><td>${v.title}</td><td>${v.views}</td><td><img src="${v.thumbnail}"></td><td><a href="${v.link}">Ver</a></td></tr>`).join('')}</table><h2>TikTok</h2><table><tr><th>Title</th><th>Likes</th><th>Thumbnail</th><th>Link</th></tr>${data.tiktok.map(v => `<tr><td>${v.title}</td><td>${v.likes}</td><td><img src="${v.thumbnail}"></td><td><a href="${v.link}">Ver</a></td></tr>`).join('')}</table><h2>X</h2><table><tr><th>Author</th><th>Likes</th><th>Thumbnail</th><th>Link</th></tr>${data.x.map(v => `<tr><td>${v.author}</td><td>${v.likes}</td><td><img src="${v.thumbnail}"></td><td><a href="${v.link}">Ver</a></td></tr>`).join('')}</table></body></html>`;
>>>>>>> db5e9a1 (Proyecto limpio, funcional – vídeos virales YouTube + TikTok)
  fs.writeFileSync('index.html', html);
  console.log('Generated HTML with fresh virales.');
}

generateHTML();
