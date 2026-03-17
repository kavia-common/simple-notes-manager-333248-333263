/**
 * API service module for the Notes Manager.
 * Provides functions to interact with the backend REST API.
 */

// Base URL for the backend API.
// Checks REACT_APP_API_BASE first (primary env var set by the platform),
// then REACT_APP_BACKEND_URL (alias), then REACT_APP_API_URL (legacy),
// and finally falls back to localhost for local development.
const API_BASE_URL =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_BACKEND_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:3001';

/**
 * Generic fetch wrapper with error handling.
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - fetch options
 * @returns {Promise<any>} parsed JSON response
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = { 'Content-Type': 'application/json' };

  const response = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

// ─── Notes API ────────────────────────────────────────────────────────────────

// PUBLIC_INTERFACE
/**
 * Fetch all notes from the backend.
 * @returns {Promise<Array>} Array of note objects
 */
export async function getAllNotes() {
  const result = await apiFetch('/notes');
  return result.data || [];
}

// PUBLIC_INTERFACE
/**
 * Search notes by query string and/or tags.
 * @param {string} query - Text to search in title/content
 * @param {string[]} tags - Array of tag names to filter by
 * @returns {Promise<Array>} Matching note objects
 */
export async function searchNotes(query = '', tags = []) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (tags.length > 0) params.set('tags', tags.join(','));
  const qs = params.toString();
  const result = await apiFetch(`/notes/search${qs ? `?${qs}` : ''}`);
  return result.data || [];
}

// PUBLIC_INTERFACE
/**
 * Get a single note by ID.
 * @param {number} id - Note ID
 * @returns {Promise<Object>} Note object
 */
export async function getNoteById(id) {
  const result = await apiFetch(`/notes/${id}`);
  return result.data;
}

// PUBLIC_INTERFACE
/**
 * Create a new note.
 * @param {Object} noteData - Note data { title, content, tags }
 * @returns {Promise<Object>} Created note object
 */
export async function createNote(noteData) {
  const result = await apiFetch('/notes', {
    method: 'POST',
    body: JSON.stringify(noteData),
  });
  return result.data;
}

// PUBLIC_INTERFACE
/**
 * Update an existing note (full replace).
 * @param {number} id - Note ID
 * @param {Object} noteData - Updated note data { title, content, tags }
 * @returns {Promise<Object>} Updated note object
 */
export async function updateNote(id, noteData) {
  const result = await apiFetch(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(noteData),
  });
  return result.data;
}

// PUBLIC_INTERFACE
/**
 * Delete a note by ID.
 * @param {number} id - Note ID
 * @returns {Promise<void>}
 */
export async function deleteNote(id) {
  await apiFetch(`/notes/${id}`, { method: 'DELETE' });
}

// ─── Tags API ─────────────────────────────────────────────────────────────────

// PUBLIC_INTERFACE
/**
 * Fetch all tags from the backend.
 * @returns {Promise<Array>} Array of tag objects { id, name }
 */
export async function getAllTags() {
  const result = await apiFetch('/tags');
  return result.data || [];
}

// PUBLIC_INTERFACE
/**
 * Create a new tag.
 * @param {string} name - Tag name
 * @returns {Promise<Object>} Created tag object
 */
export async function createTag(name) {
  const result = await apiFetch('/tags', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return result.data;
}

// PUBLIC_INTERFACE
/**
 * Delete a tag by ID.
 * @param {number} id - Tag ID
 * @returns {Promise<void>}
 */
export async function deleteTag(id) {
  await apiFetch(`/tags/${id}`, { method: 'DELETE' });
}
