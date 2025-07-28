async function fetchTikTokVideos() {
  try {
    const response = await fetch("public/videos.json");
    const data = await response.json();
    const tiktokContainer = document.getElementById("tiktok-videos");

    data.tiktok.forEach(video => {
      const col = document.createElement("div");
      col.className = "col-md-4";
      col.innerHTML = `
        <div class="card">
          <img src="${video.thumbnail}" class="card-img-top" alt="tiktok">
          <div class="card-body">
            <h5 class="card-title">${video.title}</h5>
            <a href="${video.url}" class="btn btn-primary" target="_blank">Ver</a>
          </div>
        </div>`;
      tiktokContainer.appendChild(col);
    });
  } catch (error) {
    console.error("Error fetching TikTok videos from JSON:", error);
  }
}

function updateChart() {
  const ctx = document.getElementById("chart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["YouTube", "TikTok"],
      datasets: [{
        label: "Vídeos virales",
        data: [10, 10],
      }]
    }
  });
}

async function init() {
  await fetchTikTokVideos();
  updateChart();
}

document.addEventListener("DOMContentLoaded", init);