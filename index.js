(async function() {
  setLoginUrl();
  const token = getToken();
  let titles;
  if (token) {
    window.addEventListener('load', async () => {
      const el = document.querySelector('#login');
      el.classList.add('hidden');
      showBody();
      titles = await getTitles(token[1]);
      setupYears(titles.map(t => t.addedAt));
      let top10 = titles.slice(0, 10);
      generateAlbums(top10);
    });
  } else {
    window.addEventListener('load', async () => {
      let el = document.querySelector('#progressbar');
      el.classList.add('hidden');
      showBody();
    });
  }

  function showBody() {
    const body = document.querySelector('body');
    body.classList.toggle('hidden');
  }

  function getToken() {
    const loc = new URL(document.location);
    let params = loc.hash.replace('#', '').split('&');
    params = params.map((string) => string.split('='));
    return params.find((p) => p[0] == 'access_token');
  }

  function setupYears(dates) {
    let years = new Set(dates.map(m => m.getFullYear()));
    years = Array.from(years);
    years.sort();
    const container = document.querySelector('#years');
    container.classList.toggle('hidden');
    document.querySelector('button').addEventListener('click', onYearButtonClick);
    years.forEach((y) => {
      let el = document.createElement('button');
      el.addEventListener('click', onYearButtonClick);
      let text = document.createTextNode(y);
      el.appendChild(text);
      container.appendChild(el);
    });
  }

  async function onYearButtonClick(event) {
    let year = event.target.textContent;
    document.querySelectorAll('button').forEach(b => b.classList = []);
    event.target.classList = ['font-bold'];
    let _titles = titles.map(a => ({...a}));;
    if (year !== 'All') {
      _titles = titles.filter( t => t.addedAt.getFullYear() === Number.parseInt(year)) 
    }
    let top10 = _titles.slice(0, 10);
    generateAlbums(top10);
  }

  function generateAlbums(albums) {
    const parentRef = document.querySelector('#albums');
    parentRef.innerHTML = '';
    albums.forEach((album) => {
      const el = document.createElement('li');
      el.classList.add(...['flex', 'items-center']);
      const img = document.createElement('img');
      img.classList.add(...['max-h-16', 'pr-2']);
      img.src = album.cover;
      el.appendChild(img);
      const link = document.createElement('a');
      link.href = album.url;
      link.innerHTML = album.name;
      el.appendChild(link);
      parentRef.appendChild(el);
    });
  }

  function setLoginUrl() {
     window.addEventListener("load", function(event) {
       const el = document.querySelector('#login');
       let callbackUrl = 'https://ishouldbuythesealbums.netlify.app';
       if (document.location.hostname === 'localhost') {
         callbackUrl = 'http://localhost:8080';
       }
       el.href = `https://accounts.spotify.com/authorize?client_id=15c5a1c562844ffdbb46ff90219b9b22&response_type=token&redirect_uri=${callbackUrl}&scope=user-library-read`;
    });
   }

  function updateProgressBar(state) {
    const el = document.querySelector('#progress');
    el.style.width = `${state*100}%`; 
  }

  async function getTitles(token) {
    const LIMIT = 10000;
    const STEPS = 50;
    let apiUrl;
    let offset = 0;
    let formatted = []
    let next = true;
    while (offset < LIMIT && next) {
      apiUrl = `https://api.spotify.com/v1/me/tracks?limit=${STEPS}&offset=${offset}`;
      let res = await fetch(apiUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${token}`} } );
      res = await res.json();
      formatted = formatted.concat(res.items.map( ({ added_at, track }) => ({ 
        name: track.name,
        album: track.album.name,
        cover: track.album.images[0].url,
        artist: track.artists[0].name,
        url: track.album.external_urls.spotify,
        addedAt: new Date(added_at),
      } )))
      offset += STEPS;
      next = !!res.next;
      updateProgressBar(offset/LIMIT);
    }
    updateProgressBar(1);

    let stats = formatted.reduce((acc, curr) => {
      const index = `${curr.artist} - ${curr.album}`;
      if (acc[index]) {
        acc[index].count += 1;
      } else {
        acc[index] = { name: index, addedAt: curr.addedAt ,url: curr.url, cover: curr.cover, count: 1 };
      }
      return acc;
    }, {});

    let sorted = Object.values(stats).sort((a, b) => {
      return b.count - a.count;
    })
    return sorted;
  }
})();
