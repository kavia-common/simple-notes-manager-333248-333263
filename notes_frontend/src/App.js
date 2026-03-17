import React, { useState, useEffect, useCallback, useRef } from 'react';
import NoteList from './components/NoteList';
import NoteDetail from './components/NoteDetail';
import Toast from './components/Toast';
import {
  getAllNotes,
  searchNotes,
  createNote,
  updateNote,
  deleteNote,
  getAllTags,
} from './services/api';
import './App.css';

/**
 * Root application component.
 * Manages the two-panel notes manager layout:
 *   - Left panel: note list with search and tag filters
 *   - Right panel: note detail/edit form
 */

// PUBLIC_INTERFACE
function App() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isNewNote, setIsNewNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'detail'

  // Debounce timer ref for search
  const searchTimer = useRef(null);

  // ── Data Loading ───────────────────────────────────────────────────────────

  /**
   * Show a toast notification.
   * @param {string} message - notification text
   * @param {string} type - 'success' | 'error' | 'info'
   */
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  /**
   * Load tags from the backend.
   */
  const loadTags = useCallback(async () => {
    try {
      const tags = await getAllTags();
      setAllTags(tags);
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  }, []);

  /**
   * Load/refresh the notes list, optionally filtered by search/tag.
   * @param {string} query - current search query
   * @param {string} tag   - current tag filter
   */
  const loadNotes = useCallback(async (query = '', tag = '') => {
    setLoading(true);
    try {
      let fetchedNotes;
      if (query || tag) {
        fetchedNotes = await searchNotes(query, tag ? [tag] : []);
      } else {
        fetchedNotes = await getAllNotes();
      }
      setNotes(fetchedNotes);
    } catch (err) {
      console.error('Failed to load notes:', err);
      showToast('Failed to load notes. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Initial load
  useEffect(() => {
    loadTags();
    loadNotes('', '');
  }, [loadTags, loadNotes]);

  // ── Search & Filter ────────────────────────────────────────────────────────

  /**
   * Handle search query changes with debounce.
   * @param {string} value - new search text
   */
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      loadNotes(value, selectedTag);
    }, 300);
  }, [loadNotes, selectedTag]);

  /**
   * Handle tag filter selection.
   * @param {string} tagName - tag name to filter by (or '' for all)
   */
  const handleTagFilter = useCallback((tagName) => {
    setSelectedTag(tagName);
    loadNotes(searchQuery, tagName);
  }, [loadNotes, searchQuery]);

  // ── Note Actions ───────────────────────────────────────────────────────────

  /**
   * Select a note from the list to view/edit.
   * @param {Object} note - note object to select
   */
  const handleSelectNote = useCallback((note) => {
    setSelectedNote(note);
    setIsNewNote(false);
    setMobileView('detail');
  }, []);

  /**
   * Start creating a new note.
   */
  const handleNewNote = useCallback(() => {
    setSelectedNote(null);
    setIsNewNote(true);
    setMobileView('detail');
  }, []);

  /**
   * Cancel editing / go back to list.
   */
  const handleCancel = useCallback(() => {
    setSelectedNote(null);
    setIsNewNote(false);
    setMobileView('list');
  }, []);

  /**
   * Save a note (create or update).
   * @param {Object} noteData - { title, content, tags }
   */
  const handleSave = useCallback(async (noteData) => {
    setSaving(true);
    try {
      let savedNote;
      if (isNewNote) {
        savedNote = await createNote(noteData);
        showToast('Note created!', 'success');
      } else if (selectedNote) {
        savedNote = await updateNote(selectedNote.id, noteData);
        showToast('Note saved!', 'success');
      }

      // Refresh notes and tags (tags may have been created)
      await Promise.all([loadNotes(searchQuery, selectedTag), loadTags()]);

      // Update selected note to reflect saved state
      if (savedNote) {
        setSelectedNote(savedNote);
        setIsNewNote(false);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
      showToast(`Failed to save note: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  }, [isNewNote, selectedNote, loadNotes, loadTags, searchQuery, selectedTag, showToast]);

  /**
   * Delete a note by ID.
   * @param {number} id - note ID to delete
   */
  const handleDelete = useCallback(async (id) => {
    try {
      await deleteNote(id);
      showToast('Note deleted.', 'success');

      // Clear selection and refresh
      setSelectedNote(null);
      setIsNewNote(false);
      setMobileView('list');
      await Promise.all([loadNotes(searchQuery, selectedTag), loadTags()]);
    } catch (err) {
      console.error('Failed to delete note:', err);
      showToast(`Failed to delete note: ${err.message}`, 'error');
    }
  }, [loadNotes, loadTags, searchQuery, selectedTag, showToast]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const showDetail = selectedNote !== null || isNewNote;

  return (
    <div className="app-root">
      {/* App layout */}
      <div className={`app-layout ${showDetail ? 'has-detail' : ''}`}>
        {/* Left panel: note list */}
        <aside
          className={`panel panel-left ${mobileView === 'detail' ? 'panel-hidden-mobile' : ''}`}
          aria-label="Notes list"
        >
          <NoteList
            notes={notes}
            tags={allTags}
            selectedNote={selectedNote}
            selectedTag={selectedTag}
            searchQuery={searchQuery}
            onSelectNote={handleSelectNote}
            onNewNote={handleNewNote}
            onSearchChange={handleSearchChange}
            onTagFilter={handleTagFilter}
            loading={loading}
          />
        </aside>

        {/* Right panel: note detail / edit */}
        <main
          className={`panel panel-right ${mobileView === 'list' && !showDetail ? 'panel-hidden-mobile' : ''}`}
          aria-label="Note detail"
        >
          <NoteDetail
            note={selectedNote}
            allTags={allTags}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={handleCancel}
            saving={saving}
            isNew={isNewNote}
          />
        </main>
      </div>

      {/* Toast notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  );
}

export default App;
