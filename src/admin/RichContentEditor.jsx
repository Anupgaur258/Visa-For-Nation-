import { useEffect, useRef } from 'react';

const TOOL_GROUPS = [
  [
    ['bold', 'B', 'Bold'],
    ['italic', 'I', 'Italic'],
    ['underline', 'U', 'Underline'],
    ['strikeThrough', 'S', 'Strike through'],
  ],
  [
    ['formatBlock:p', 'Paragraph', 'Paragraph'],
    ['formatBlock:h2', 'H2', 'Heading 2'],
    ['formatBlock:h3', 'H3', 'Heading 3'],
  ],
  [
    ['insertUnorderedList', '• List', 'Bulleted list'],
    ['insertOrderedList', '1. List', 'Numbered list'],
    ['outdent', '←', 'Decrease indent'],
    ['indent', '→', 'Increase indent'],
  ],
  [
    ['justifyLeft', 'Left', 'Align left'],
    ['justifyCenter', 'Center', 'Align center'],
    ['justifyRight', 'Right', 'Align right'],
  ],
  [
    ['createLink', 'Link', 'Insert link'],
    ['unlink', 'Unlink', 'Remove link'],
    ['removeFormat', 'Clear', 'Clear formatting'],
    ['undo', 'Undo', 'Undo'],
    ['redo', 'Redo', 'Redo'],
  ],
];

export default function RichContentEditor({ value = '', onChange, resetKey, id, placeholder = 'Write your content here…' }) {
  const editorRef = useRef(null);
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value || '';
  }, [resetKey]);

  const runCommand = action => {
    editorRef.current?.focus();
    if (action === 'createLink') {
      const url = window.prompt('Enter a link URL');
      if (!url) return;
      document.execCommand('createLink', false, url);
    } else if (action.startsWith('formatBlock:')) {
      document.execCommand('formatBlock', false, action.split(':')[1]);
    } else {
      document.execCommand(action, false);
    }
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  return <div className="adm-nav-rich-editor adm-rich-content-editor">
    <div className="adm-nav-rich-toolbar" role="toolbar" aria-label="Content formatting">
      {TOOL_GROUPS.map((group, groupIndex) => <div className="adm-rich-tool-group" key={groupIndex}>
        {group.map(([action, label, title]) => <button type="button" key={action} title={title} aria-label={title} onMouseDown={event => event.preventDefault()} onClick={() => runCommand(action)}>{label === 'B' ? <strong>{label}</strong> : label === 'I' ? <em>{label}</em> : label === 'U' ? <u>{label}</u> : label === 'S' ? <s>{label}</s> : label}</button>)}
      </div>)}
    </div>
    <div id={id} ref={editorRef} className="adm-nav-rich-surface" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" data-placeholder={placeholder} onInput={event => onChange(event.currentTarget.innerHTML)} />
  </div>;
}
