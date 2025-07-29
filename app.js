
fetch('/videos.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('video-list');
    data.forEach(video => {
      const col = document.createElement('div');
      col.className = 'col-md-4 mb-4';
      col.innerHTML = `
        <div class="card h-100">
          <img src="${video.thumbnail}" class="card-img-top" alt="thumbnail">
          <div class="card-body">
            <h5 class="card-title">${video.title}</h5>
            <a href="${video.url}" class="btn btn-primary" target="_blank">Ver</a>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  })
  .catch(err => {
    console.error("Error cargando videos.json", err);
  });
