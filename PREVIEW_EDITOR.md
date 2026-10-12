# Customizable preview editing

Open **आदेश बनाउनुहोस्**, then **Tools**.

- **Paragraph styles & formatting:** customize सामान्य अनुच्छेद, शीर्षक, बहस, ठहर, तपसिल and हस्ताक्षर styles. Set font, size, colour, alignment, line/paragraph spacing, indents, tab stops and keep options. Save a style for reuse, or apply settings only to the selected paragraphs.
- **Find & replace:** search the body or whole document, navigate matches, and replace individual/all occurrences. Nepali normalization is optional and never rewrites document spelling automatically.
- **Page layout:** choose A4/Letter, orientation and margins; insert/remove page breaks and keep selected paragraphs together. These properties are included in DOCX.
- **Reusable snippets:** save your own named text and insert it at the cursor.
- **Recovery versions:** save, compare and restore versions for the current case. Restoring can be undone. The original Save button remains available.
- **Customize editor:** show/hide the compact toolbar and formatting marks; choose paste behaviour, recovery interval, retained version count, tab width and import review policy.

Paste can retain supported text/paragraph formatting, match the document, or use plain text. Active content, images and external embeds are removed. Pasted tables are converted to text paragraphs.

Re-importing बहस or आदेश checks for manual text and formatting edits. Review the current/proposed text before replacing an edited import. Keep current text cancels replacement; the proposed passage can be edited before applying. The आदेश stays below बहस.

Numbering supports existing English styles plus १, १.१ and क. Choose a custom start value to restart, or **Continue previous numbering** to join the preceding sequence.

Keyboard: Ctrl+B/I/U, Ctrl+Z/Y, Ctrl+F/H, Ctrl+S, Tab and Ctrl+Enter. Enter and Shift+Enter create paragraphs. At a collapsed cursor, formatting applies to the current paragraph; selecting text applies inline formatting.

Styles, snippets, preferences and recovery versions are saved in this browser. Recovery is separate from the existing manual draft save and synchronization. Downloads retain text, inline formatting, paragraph spacing, indents, tab stops, keep properties, page breaks and page margins. Word and print browsers determine automatic pagination; installed fonts can affect layout.

No editor-framework migration or external editing service is required. The retained static site and GitHub Actions build remain in use. The build runs preview-editor.test.cjs to verify original-text search offsets and DOCX formatting serialization.
