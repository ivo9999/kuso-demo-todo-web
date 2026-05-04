// Frontend logic for the kuso demo todo app. Talks to the Go API
// over fetch. The base URL comes from /config.js (runtime-injected
// by server.js so we don't need to rebuild for a different API).
const API = (window.__KUSO_API_BASE__ || "").replace(/\/$/, "");

const $list = document.getElementById("list");
const $empty = document.getElementById("empty");
const $error = document.getElementById("error");
const $form = document.getElementById("new-form");
const $title = document.getElementById("new-title");

function showError(msg) {
  $error.textContent = msg;
  $error.hidden = false;
}
function clearError() { $error.hidden = true; }

async function api(path, init) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`${res.status} ${await res.text()}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function makeRow(t) {
  const li = document.createElement("li");
  if (t.done) li.classList.add("done");

  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = !!t.done;
  cb.addEventListener("change", (e) => toggle(t.id, e.target.checked));

  const title = document.createElement("span");
  title.className = "title";
  title.textContent = t.title;

  const del = document.createElement("button");
  del.className = "del";
  del.textContent = "delete";
  del.addEventListener("click", () => remove(t.id));

  li.append(cb, title, del);
  return li;
}

function render(todos) {
  $list.replaceChildren(...todos.map(makeRow));
  $empty.hidden = todos.length > 0;
}

async function load() {
  try {
    clearError();
    const todos = await api("/api/todos");
    render(todos);
  } catch (err) { showError(`load failed: ${err.message}`); }
}

async function create(title) {
  try {
    clearError();
    await api("/api/todos", { method: "POST", body: JSON.stringify({ title }) });
    await load();
  } catch (err) { showError(`create failed: ${err.message}`); }
}

async function toggle(id, done) {
  try {
    clearError();
    await api(`/api/todos/${id}`, { method: "PATCH", body: JSON.stringify({ done }) });
    await load();
  } catch (err) { showError(`update failed: ${err.message}`); }
}

async function remove(id) {
  try {
    clearError();
    await api(`/api/todos/${id}`, { method: "DELETE" });
    await load();
  } catch (err) { showError(`delete failed: ${err.message}`); }
}

$form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $title.value.trim();
  if (!title) return;
  $title.value = "";
  create(title);
});

load();
