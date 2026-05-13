// Case File Interactive Features

class CaseFileManager {
  constructor(caseId) {
    this.caseId = caseId;
    this.currentHighlight = null;
    this.highlights = [];
    this.notes = [];
    this.selectedColor = 'yellow';
    this.init();
  }

  init() {
    this.loadHighlights();
    this.loadNotes();
    this.setupEventListeners();
    this.renderHighlights();
    this.renderNotes();
  }

  // ==================== HIGHLIGHTING SYSTEM ====================
  setupEventListeners() {
    document.addEventListener('mouseup', (e) => {
      if (e.target.closest && e.target.closest('#highlightControls')) return;
      this.handleTextSelection();
    });
    
    // Highlight item clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('highlight-item')) {
        this.scrollToHighlight(e.target.dataset.highlightId);
      }
      if (e.target.classList.contains('highlight-delete')) {
        this.deleteHighlight(e.target.dataset.highlightId);
      }
      if (e.target.classList.contains('note-delete')) {
        this.deleteNote(e.target.dataset.noteId);
      }
    });

    // Color picker for notes
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('color-btn')) {
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.selectedColor = e.target.dataset.color;
      }
    });

    // Add note button
    const addNoteBtn = document.getElementById('addNoteBtn');
    if (addNoteBtn) {
      addNoteBtn.addEventListener('click', () => this.createNote());
    }

    // Note input enter key
    const noteInput = document.getElementById('noteInput');
    if (noteInput) {
      noteInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
          this.createNote();
        }
      });
    }

    // Clear highlights
    const clearHighlightsBtn = document.getElementById('clearHighlightsBtn');
    if (clearHighlightsBtn) {
      clearHighlightsBtn.addEventListener('click', () => this.clearAllHighlights());
    }
  }

  handleTextSelection() {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText.length === 0) {
      this.hideHighlightControls();
      return;
    }

    // Show highlight color picker
    this.showHighlightControls(selectedText);
  }

  showHighlightControls(selectedText) {
    let controls = document.getElementById('highlightControls');
    
    if (!controls) {
      controls = document.createElement('div');
      controls.id = 'highlightControls';
      controls.className = 'highlight-controls';
      document.body.appendChild(controls);
    }

    // Color buttons
    const colors = [
      { name: 'yellow', icon: '⭐', label: 'Yellow' },
      { name: 'green', icon: '✓', label: 'Green' },
      { name: 'red', icon: '✗', label: 'Red' },
      { name: 'blue', icon: 'ℹ', label: 'Blue' }
    ];

    controls.innerHTML = colors.map(color => 
      `<button class="highlight-color-btn ${color.name}" data-color="${color.name}" title="${color.label}">${color.icon}</button>`
    ).join('');

    controls.innerHTML += `<button class="clear-highlight-btn" id="clearHighlightBtn">Clear</button>`;

    // Position below selection
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      let top = rect.bottom + 10;
      let left = rect.left;

      // Approximate controls size
      const controlsWidth = 200;
      const controlsHeight = 50;

      // Adjust if off screen
      if (top + controlsHeight > window.innerHeight) {
        top = rect.top - controlsHeight - 10;
      }
      if (left + controlsWidth > window.innerWidth) {
        left = window.innerWidth - controlsWidth - 10;
      }
      if (top < 0) top = 10;
      if (left < 0) left = 10;

      controls.style.top = top + 'px';
      controls.style.left = left + 'px';
    }

    // Controls click handler
    controls.onclick = (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      if (btn.classList.contains('highlight-color-btn')) {
        const color = btn.dataset.color;
        this.addHighlight(selectedText, color);
        this.hideHighlightControls();
      }

      if (btn.id === 'clearHighlightBtn') {
        this.hideHighlightControls();
      }
    };
  }

  hideHighlightControls() {
    const controls = document.getElementById('highlightControls');
    if (controls) {
      controls.remove();
    }
  }

  addHighlight(text, color) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (!range || range.collapsed) return;

    // Create highlight span
    const span = document.createElement('span');
    span.className = `text-highlight ${color}`;
    span.dataset.highlightId = Date.now().toString();

    try {
      // Surround the selected text with the span
      range.surroundContents(span);

      // Add to highlights array for sidebar
      const highlight = {
        id: span.dataset.highlightId,
        text: text.substring(0, 100), // Limit length
        color,
        timestamp: new Date().toLocaleTimeString()
      };

      this.highlights.push(highlight);
      this.saveHighlights();
      this.renderHighlights();

      // Clear selection
      selection.removeAllRanges();

      // Visual feedback
      this.flashMessage('Highlighted!');
    } catch (e) {
      // If surroundContents fails (e.g., selection spans multiple elements), show error
      alert('Cannot highlight across multiple elements. Try selecting text within a single paragraph.');
    }
  }

  renderHighlights() {
    const highlightsList = document.getElementById('highlightsList');
    if (!highlightsList) return;

    if (this.highlights.length === 0) {
      highlightsList.innerHTML = '<div class="empty-highlights">Select text to highlight and take notes</div>';
      return;
    }

    highlightsList.innerHTML = this.highlights.map(h => `
      <div class="highlight-item ${h.color}" data-highlight-id="${h.id}">
        <span class="highlight-color" style="background-color: ${this.getColorCode(h.color)}"></span>
        "${h.text}"
        <button class="highlight-delete" data-highlight-id="${h.id}" title="Delete highlight">×</button>
      </div>
    `).join('');
  }

  scrollToHighlight(highlightId) {
    const highlightSpan = document.querySelector(`[data-highlight-id="${highlightId}"]`);
    if (highlightSpan) {
      highlightSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightSpan.style.animation = 'highlight-flash 1s';
      setTimeout(() => highlightSpan.style.animation = '', 1000);
    }
    this.flashMessage('Highlight located!');
  }

  clearAllHighlights() {
    if (confirm('Clear all highlights?')) {
      this.highlights = [];
      this.saveHighlights();
      this.renderHighlights();
      this.flashMessage('Highlights cleared');
    }
  }

  // ==================== STICKY NOTES SYSTEM ====================
  createNote() {
    const noteInput = document.getElementById('noteInput');
    if (!noteInput || noteInput.value.trim() === '') {
      alert('Please write something first');
      return;
    }

    const note = {
      id: Date.now().toString(),
      content: noteInput.value.trim(),
      color: this.selectedColor || 'yellow',
      timestamp: new Date().toLocaleString()
    };

    this.notes.push(note);
    this.saveNotes();
    this.renderNotes();
    noteInput.value = '';
    this.flashMessage('Note created!');
  }

  deleteNote(noteId) {
    this.notes = this.notes.filter(n => n.id !== noteId);
    this.saveNotes();
    this.renderNotes();
  }

  deleteHighlight(highlightId) {
    // Remove the highlight span from the DOM
    const highlightSpan = document.querySelector(`[data-highlight-id="${highlightId}"]`);
    if (highlightSpan) {
      // Replace the span with its text content
      const textNode = document.createTextNode(highlightSpan.textContent);
      highlightSpan.parentNode.replaceChild(textNode, highlightSpan);
    }
    // Remove from highlights array
    this.highlights = this.highlights.filter(h => h.id !== highlightId);
    this.saveHighlights();
    this.renderHighlights();
  }

  renderNotes() {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;

    if (this.notes.length === 0) {
      notesList.innerHTML = '<div class="empty-notes">💭 No notes yet. Add one to get started!</div>';
      return;
    }

    notesList.innerHTML = this.notes.map(note => `
      <div class="sticky-note ${note.color}">
        <div class="note-time">${note.timestamp}</div>
        <div class="note-content">${this.escapeHtml(note.content)}</div>
        <button class="note-delete" data-note-id="${note.id}" title="Delete note">×</button>
      </div>
    `).join('');
  }

  // ==================== PERSISTENCE ====================
  saveHighlights() {
    localStorage.setItem(`case_highlights_${this.caseId}`, JSON.stringify(this.highlights));
  }

  loadHighlights() {
    const saved = localStorage.getItem(`case_highlights_${this.caseId}`);
    this.highlights = saved ? JSON.parse(saved) : [];
  }

  saveNotes() {
    localStorage.setItem(`case_notes_${this.caseId}`, JSON.stringify(this.notes));
  }

  loadNotes() {
    const saved = localStorage.getItem(`case_notes_${this.caseId}`);
    this.notes = saved ? JSON.parse(saved) : [];
  }

  // ==================== UTILITIES ====================
  getColorCode(colorName) {
    const colors = {
      yellow: '#ffc107',
      green: '#4caf50',
      red: '#ff4336',
      blue: '#2196f3'
    };
    return colors[colorName] || '#ffc107';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  flashMessage(message) {
    // Optional: Add toast notification
    console.log('message:', message);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const caseId = document.body.dataset.caseId;
  if (caseId) {
    new CaseFileManager(caseId);
  }
});
