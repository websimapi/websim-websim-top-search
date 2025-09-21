/* ...existing code... */
// Simple fetch UI for: https://api.websim.com/api/v1/feed/trending?limit=24&offset=0&feed=hot_desktop&range=all

const API_URL = 'https://api.websim.com/api/v1/feed/trending?limit=24&offset=0&feed=hot_desktop&range=all';

const fetchBtn = document.getElementById('fetchBtn');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const rawEl = document.getElementById('rawJson');

function setStatus(text, busy = false) {
  statusEl.textContent = text;
  statusEl.style.color = busy ? '#0b63d6' : '';
}

function clearResults() {
  resultsEl.innerHTML = '';
  rawEl.textContent = '{}';
}

function renderItem(item){
  // item might be an object; show meaningful fields if present
  const div = document.createElement('div');
  div.className = 'card';
  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = item.title || item.name || item.id || 'Untitled';
  const meta = document.createElement('div');
  meta.className = 'meta';
  // create a concise metadata line
  const metaParts = [];
  if (item.type) metaParts.push(item.type);
  if (item.score !== undefined) metaParts.push('score: ' + item.score);
  if (item.author) metaParts.push('by ' + item.author);
  meta.textContent = metaParts.join(' • ') || JSON.stringify(item).slice(0,80);
  const body = document.createElement('pre');
  body.style.margin='0';
  body.style.background='transparent';
  body.style.border='none';
  body.style.padding='0';
  body.textContent = JSON.stringify(item, null, 2);
  div.appendChild(title);
  div.appendChild(meta);
  div.appendChild(body);
  return div;
}

async function fetchAndShow() {
  clearResults();
  setStatus('Fetching...', true);
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    rawEl.textContent = JSON.stringify(data, null, 2);

    // Try to find an array of items in response
    let items = [];
    if (Array.isArray(data)) items = data;
    else if (Array.isArray(data.results)) items = data.results;
    else if (Array.isArray(data.items)) items = data.items;
    else {
      // fallback: show top-level keys as single card
      items = [data];
    }

    if (items.length === 0) {
      setStatus('No results', false);
      resultsEl.textContent = 'No items found.';
      return;
    }

    // render up to 36 items
    items.slice(0, 36).forEach(it => resultsEl.appendChild(renderItem(it)));
    setStatus(`Fetched ${items.length} item(s)`, false);
  } catch (err) {
    setStatus('Error', false);
    resultsEl.textContent = 'Fetch failed: ' + err.message;
    rawEl.textContent = '';
    console.error(err);
  }
}

fetchBtn.addEventListener('click', fetchAndShow);

// auto-fetch on load
fetchAndShow();
/* ...existing code... */