import React from 'react';

/**
 * NoteList component - renders the left panel with search, tag filters, and note list.
 * 
 * Props:
 *   notes {Array}           - array of note objects to display
 *   tags {Array}            - array of all available tag objects
 *   selectedNote {Object}   - currently selected note (or null)
 *   selectedTag {string}    - currently active tag filter (or '')
 *   searchQuery {string}    - current search query string
 *   onSelectNote {Function} - callback when a note is clicked
 *   onNewNote {Function}    - callback to create a new note
 *   onSearchChange {Function} - callback when search input changes
 *   onTagFilter {Function}  - callback when a tag filter is selected/deselected
 *   loading {boolean}       - whether data is loading
 */

// PUBLIC_INTERFACE
function NoteList({
  notes,
  tags,
  selectedNote,
  selectedTag,
  searchQuery,
  onSelectNote,
  onNewNote,
  onSearchChange,
  onTagFilter,
  loading,
}) {
  /**
   * Format a date string into a readable relative or absolute date.
   * @param {string} dateStr - ISO date string
   * @returns {string} formatted date
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  /**
   * Get a short preview of note content (first 80 chars).
   * @param {string} content - note content
   * @returns {string} truncated preview
   */
  const getPreview = (content) => {
    if (!content) return 'No content';
    const plain = content.replace(/\n/g, ' ').trim();
    return plain.length > 80 ? plain.substring(0, 80) + '…' : plain;
  };

  return (
    <div className="note-list-panel">
      {/* Header with title and new note button */}
      <div className="panel-header">
        <h1 className="app-title">
          <span className="app-title-icon">📝</span>
          Notes
        </h1>
        <button
          className="btn btn-primary btn-icon"
          onClick={onNewNote}
          title="Create new note"
          aria-label="Create new note"
        >
          <span className="btn-icon-symbol">+</span>
          <span className="btn-text">New</span>
        </button>
      </div>

      {/* Search input */}
      <div className="search-bar-wrapper">
        <div className="search-bar">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search notes"
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tag filter chips */}
      {tags.length > 0 && (
        <div className="tag-filter-area">
          <div className="tag-filter-label">Filter by tag:</div>
          <div className="tag-chips">
            <button
              className={`tag-chip ${!selectedTag ? 'tag-chip-active' : ''}`}
              onClick={() => onTagFilter('')}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                className={`tag-chip ${selectedTag === tag.name ? 'tag-chip-active' : ''}`}
                onClick={() => onTagFilter(selectedTag === tag.name ? '' : tag.name)}
                title={`Filter by ${tag.name}`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="notes-list" role="listbox" aria-label="Notes">
        {loading ? (
          <div className="list-state list-loading">
            <div className="spinner" aria-label="Loading notes"></div>
            <p>Loading notes…</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="list-state list-empty">
            <div className="empty-icon" aria-hidden="true">📄</div>
            <p className="empty-message">
              {searchQuery || selectedTag
                ? 'No notes match your filters.'
                : 'No notes yet. Create your first note!'}
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`note-item ${selectedNote && selectedNote.id === note.id ? 'note-item-active' : ''}`}
              onClick={() => onSelectNote(note)}
              role="option"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectNote(note)}
              aria-selected={!!(selectedNote && selectedNote.id === note.id)}
            >
              <div className="note-item-header">
                <span className="note-item-title">
                  {note.title || 'Untitled Note'}
                </span>
                <span className="note-item-date">{formatDate(note.updatedAt)}</span>
              </div>
              <p className="note-item-preview">{getPreview(note.content)}</p>
              {note.tags && note.tags.length > 0 && (
                <div className="note-item-tags">
                  {note.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="note-tag-badge">{tag}</span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="note-tag-badge note-tag-more">+{note.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Notes count footer */}
      {!loading && notes.length > 0 && (
        <div className="list-footer">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </div>
      )}
    </div>
  );
}

export default NoteList;
