import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom Rich Text Editor — replaces react-quill (incompatible with React 19).
 * Uses contentEditable with execCommand for formatting.
 */

const TOOLBAR_ACTIONS = [
  { cmd: 'bold', icon: 'B', title: 'Bold', style: 'font-weight: 700' },
  { cmd: 'italic', icon: 'I', title: 'Italic', style: 'font-style: italic' },
  { cmd: 'underline', icon: 'U', title: 'Underline', style: 'text-decoration: underline' },
  { cmd: 'strikeThrough', icon: 'S', title: 'Strikethrough', style: 'text-decoration: line-through' },
  { type: 'divider' },
  { cmd: 'formatBlock', arg: 'H1', icon: 'H1', title: 'Heading 1' },
  { cmd: 'formatBlock', arg: 'H2', icon: 'H2', title: 'Heading 2' },
  { cmd: 'formatBlock', arg: 'BLOCKQUOTE', icon: '❝', title: 'Blockquote' },
  { type: 'divider' },
  { cmd: 'insertUnorderedList', icon: '•', title: 'Bullet List' },
  { cmd: 'insertOrderedList', icon: '1.', title: 'Numbered List' },
  { type: 'divider' },
  { cmd: 'createLink', icon: '🔗', title: 'Insert Link' },
  { cmd: 'formatBlock', arg: 'P', icon: '¶', title: 'Normal Text' },
];

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // Initialize content from value prop
  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      setIsEmpty(!value);
    }
  }, []); // Only on mount

  const execCommand = useCallback((cmd, arg) => {
    if (cmd === 'createLink') {
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        document.execCommand(cmd, false, url);
      }
    } else if (cmd === 'formatBlock') {
      document.execCommand(cmd, false, arg);
    } else {
      document.execCommand(cmd, false, null);
    }
    editorRef.current?.focus();
  }, []);

  const handleInput = useCallback(() => {
    const html = editorRef.current?.innerHTML || '';
    const textContent = editorRef.current?.textContent || '';
    setIsEmpty(!textContent.trim());
    onChange?.(html);
  }, [onChange]);

  const handleKeyDown = useCallback((e) => {
    // Tab support
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  }, []);

  return (
    <div className="rte-container">
      <div className="rte-toolbar">
        {TOOLBAR_ACTIONS.map((action, i) => {
          if (action.type === 'divider') {
            return <div key={i} className="rte-divider" />;
          }
          return (
            <button
              key={i}
              type="button"
              className="rte-btn"
              title={action.title}
              style={action.style ? { [action.style.split(':')[0]]: action.style.split(':')[1]?.trim() } : undefined}
              onMouseDown={(e) => {
                e.preventDefault(); // Don't steal focus
                execCommand(action.cmd, action.arg);
              }}
            >
              {action.icon}
            </button>
          );
        })}
      </div>
      <div className="rte-editor-area">
        {isEmpty && (
          <div className="rte-placeholder">{placeholder || 'Start writing...'}</div>
        )}
        <div
          ref={editorRef}
          className="rte-editable"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsEmpty(!editorRef.current?.textContent.trim())}
          onBlur={() => setIsEmpty(!editorRef.current?.textContent.trim())}
        />
      </div>
    </div>
  );
}
