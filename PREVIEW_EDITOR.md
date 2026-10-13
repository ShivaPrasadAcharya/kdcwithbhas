# Customizable preview editing

Open **आदेश बनाउनुहोस्**, then **Tools**.

- **Paragraph styles & formatting:** customize सामान्य अनुच्छेद, शीर्षक, बहस, ठहर, तपसिल and हस्ताक्षर styles. Set font, size, colour, alignment, line/paragraph spacing, indents, tab stops and keep options. Save a style for reuse, or apply settings only to the selected paragraphs.
- **Find & replace:** search the body or whole document, navigate matches, and replace individual/all occurrences. Nepali normalization is optional and never rewrites document spelling automatically.
- **Page layout:** choose A4/Letter, orientation and margins; insert/remove page breaks and keep selected paragraphs together. These properties are included in DOCX.
- **Reusable snippets:** save your own named text and insert it at the cursor.
- **Recovery versions:** save, compare and restore versions for the current case. Restoring can be undone. The original Save button remains available.
- **Customize editor:** show/hide the compact toolbar and formatting marks; choose paste behaviour, recovery interval, retained version count, tab width and import review policy.

On paste, choose **Paste as text**, **Paste as source formatting**, or **Paste as destination formatting**. Destination formatting follows the text at the cursor; the default and whether to ask can be customized in Tools. Active content, images and external embeds are removed. Pasted tables are converted to text paragraphs.

Re-importing बहस or आदेश checks for manual text and formatting edits. Review the current/proposed text before replacing an edited import. Keep current text cancels replacement; the proposed passage can be edited before applying. The आदेश stays below बहस. The `text` field in `adesh-catalog.json` accepts `<b>bold</b>`, `<u>underline</u>`, `<i>italics</i>` and `<s>strikethrough</s>`, including nested combinations and formatting across newlines. The tags render as formatting rather than literal text and remain formatted in DOCX export. In the आदेश picker, **आदेशको मूल formatting राख्नुहोस्** retains this formatting. **Copy आदेश**, beside Export, copies both formatted HTML and plain text for compatible destination applications. Uncheck it to import plain text. The selection preview displays the chosen formatting, and accepting unchanged proposed text during review preserves it.

Numbering supports existing English styles plus १, १.१ and क. Choose a custom start value to restart, or **Continue previous numbering** to join the preceding sequence.

Keyboard: Ctrl+B/I/U, Ctrl+Z/Y, Ctrl+F/H, Ctrl+S, Tab and Ctrl+Enter. Enter and Shift+Enter create paragraphs. At a collapsed cursor, formatting applies to the current paragraph; selecting text applies inline formatting.

Styles, snippets, preferences and recovery versions are saved in this browser. Recovery is separate from the existing manual draft save and synchronization. Downloads retain text, inline formatting, paragraph spacing, indents, tab stops, keep properties, page breaks and page margins. Word and print browsers determine automatic pagination; installed fonts can affect layout.

No editor-framework migration or external editing service is required. The retained static site and GitHub Actions build remain in use. The build runs preview-editor.test.cjs to verify original-text search offsets and DOCX formatting serialization.

## Facts and preview cleanup

Use the fullscreen button beside **बहससहित** to expand the preview and toggle back. Escape exits fullscreen; closing the preview also exits. A viewport-filling view is available if browser fullscreen is unavailable.

The catalog's case-specific passages are marked as `<b><s>fact</s></b>` in the `text` field only. These include party and advocate names, pseudonyms, addresses, property identifiers, case/letter/receipt references, dates, amounts, shares, case-specific allegations, medical findings, factual admissions and individually chosen visit arrangements. Original wording, spelling, punctuation, sample headings, legal citations, and all other catalog fields are retained. Formation dates and cited precedent details that belong to the legal reasoning remain unmarked. Markers identify passages to review when adapting the template; they do not replace the source case facts automatically.

The dropdown beside **आदेशसहित** defaults to **Keep bold and strikethrough text**. Selecting another option applies one action to the current preview body and then returns to Keep:

- **Remove strikes only (keep text):** remove strikethrough formatting while keeping the words and bold.
- **Remove strikethrough text:** delete words shown with strikethrough.
- **Remove bold text:** delete words shown in bold.
- **Remove bold and strikethrough text:** delete words shown in bold, strikethrough, or both.

These actions preserve the document header, party block, signature, numbering markers and the catalog source. Undo restores the edited preview. DOCX export follows the resulting formatting and text.
