import React, { useState, useEffect, useCallback } from 'react';

/**
 * NoteDetail component - renders the right panel for viewing and editing a note.
 * 
 * Props:
 *   note {Object}           - currently selected note (or null for new note)
 *   allTags {Array}         - all available tags from backend
 *   onSave {Function}       - callback(noteData) to save note
 *   onDelete {Function}     - callback(id) to delete note
 *   onCancel {Function}     - callback to cancel editing/deselect
 *   saving {boolean}        - whether a save operation is in progress
 *   isNew {boolean}         - whether this is a new note being created
 */

// PUBLIC_INTERFACE
function NoteDetail({ note, allTags, onSave, onDelete, onCancel, saving, isNew }) {
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tagError, setTagError] = useState('');

  // Sync form state when note prop changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setSelectedTags(note.tags ? [...note.tags] : []);
    } else if (isNew) {
      setTitle('');
      setContent('');
      setSelectedTags([]);
    }
    setIsDirty(false);
    setNewTagInput('');
    setTagError('');
    setShowDeleteConfirm(false);
  }, [note, isNew]);

  /**
   * Handle field changes and mark form as dirty.
   */
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  /**
   * Toggle a tag selection.
   * @param {string} tagName - tag to toggle
   */
  const toggleTag = useCallback((tagName) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
    setIsDirty(true);
  }, []);

  /**
   * Add a new tag to the selection (creates it if it doesn't exist).
   */
  const handleAddNewTag = () => {
    const trimmed = newTagInput.trim().toLowerCase();
    if (!trimmed) return;

    // Validate tag name
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setTagError('Tags can only contain letters, numbers, hyphens, and underscores.');
      return;
    }

    if (!selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
      setIsDirty(true);
    }
    setNewTagInput('');
    setTagError('');
  };

  /**
   * Handle Enter key press in tag input.
   */
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewTag();
    }
  };

  /**
   * Remove a tag from the selection.
   * @param {string} tagName - tag to remove
   */
  const removeTag = (tagName) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagName));
    setIsDirty(true);
  };

  /**
   * Handle save button click.
   */
  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    onSave({ title: title.trim(), content: content.trim(), tags: selectedTags });
    setIsDirty(false);
  };

  /**
   * Handle delete confirmation.
   */
  const handleDeleteConfirm = () => {
    if (note && note.id) {
      onDelete(note.id);
    }
    setShowDeleteConfirm(false);
  };

  /**
   * Format a full date string for display.
   * @param {string} dateStr - ISO date string
   * @returns {string} formatted date
   */
  const formatFullDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!note && !isNew) {
    return (
      <div className="note-detail-panel note-detail-empty">
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">✏️</div>
          <h2 className="empty-state-title">Select a note to view</h2>
          <p className="empty-state-subtitle">
            Choose a note from the list, or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  // ── Note edit form ─────────────────────────────────────────────────────────
  return (
    <div className="note-detail-panel">
      {/* Toolbar */}
      <div className="detail-toolbar">
        <div className="toolbar-left">
          <button
            className="btn btn-ghost btn-sm"
            onClick={onCancel}
            aria-label="Back to list"
            title="Back to list"
          >
            ← Back
          </button>
        </div>
        <div className="toolbar-right">
          {!isNew && note && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
              aria-label="Delete note"
              title="Delete this note"
            >
              🗑 Delete
            </button>
          )}
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving || (!title.trim() && !content.trim())}
            aria-label={saving ? 'Saving...' : 'Save note'}
          >
            {saving ? (
              <>
                <span className="btn-spinner"></span> Saving…
              </>
            ) : (
              <>💾 Save</>
            )}
          </button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="confirm-dialog-overlay" role="dialog" aria-modal="true">
          <div className="confirm-dialog">
            <h3 className="confirm-dialog-title">Delete Note?</h3>
            <p className="confirm-dialog-message">
              This action cannot be undone. Are you sure you want to delete this note?
            </p>
            <div className="confirm-dialog-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note form */}
      <div className="note-form">
        {/* Dirty indicator */}
        {isDirty && (
          <div className="unsaved-badge" aria-live="polite">
            Unsaved changes
          </div>
        )}

        {/* Title field */}
        <div className="form-field">
          <input
            type="text"
            className="note-title-input"
            placeholder="Note title…"
            value={title}
            onChange={handleTitleChange}
            aria-label="Note title"
            autoFocus={isNew}
          />
        </div>

        {/* Metadata */}
        {!isNew && note && (
          <div className="note-metadata">
            {note.createdAt && (
              <span className="metadata-item">
                <span className="metadata-label">Created:</span>{' '}
                {formatFullDate(note.createdAt)}
              </span>
            )}
            {note.updatedAt && note.updatedAt !== note.createdAt && (
              <span className="metadata-item">
                <span className="metadata-label">Updated:</span>{' '}
                {formatFullDate(note.updatedAt)}
              </span>
            )}
          </div>
        )}

        {/* Content textarea */}
        <div className="form-field form-field-grow">
          <textarea
            className="note-content-textarea"
            placeholder="Start writing your note…"
            value={content}
            onChange={handleContentChange}
            aria-label="Note content"
          />
        </div>

        {/* Tags section */}
        <div className="tags-section">
          <div className="tags-section-header">
            <span className="tags-section-label">Tags</span>
          </div>

          {/* Selected tags */}
          <div className="selected-tags">
            {selectedTags.map((tag, i) => (
              <span key={i} className="selected-tag-badge">
                {tag}
                <button
                  className="tag-remove-btn"
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                  title={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
            {selectedTags.length === 0 && (
              <span className="no-tags-hint">No tags added yet</span>
            )}
          </div>

          {/* Existing tags to pick from */}
          {allTags.length > 0 && (
            <div className="available-tags">
              <span className="available-tags-label">Available:</span>
              <div className="available-tag-chips">
                {allTags
                  .filter((t) => !selectedTags.includes(t.name))
                  .map((tag) => (
                    <button
                      key={tag.id}
                      className="tag-chip tag-chip-sm"
                      onClick={() => toggleTag(tag.name)}
                      title={`Add tag: ${tag.name}`}
                    >
                      + {tag.name}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Add new tag input */}
          <div className="add-tag-row">
            <input
              type="text"
              className="tag-input"
              placeholder="Add a new tag…"
              value={newTagInput}
              onChange={(e) => {
                setNewTagInput(e.target.value);
                setTagError('');
              }}
              onKeyDown={handleTagInputKeyDown}
              aria-label="New tag name"
              maxLength={50}
            />
            <button
              className="btn btn-outline btn-sm"
              onClick={handleAddNewTag}
              disabled={!newTagInput.trim()}
              aria-label="Add tag"
            >
              Add
            </button>
          </div>
          {tagError && <p className="tag-error" role="alert">{tagError}</p>}
        </div>
      </div>
    </div>
  );
}

export default NoteDetail;
