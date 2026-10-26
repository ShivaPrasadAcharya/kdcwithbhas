# readymadeorders — बहससहित नेपाली अदालती आदेश/फैसला

Created from `ShivaPrasadAcharya/kdc`, with the advocate lookup and sentence generator from `ShivaPrasadAcharya/bahasgenerator`.

1. Load/filter the cause list and open **आदेश बनाउनुहोस्**.
2. Choose the document type and **पक्षहरूको हैसियत**.
3. Click **बहससहित** in the preview header. The form inherits both side labels, including combined labels and full reverse.
4. Enter advocate licence numbers or custom names, and optionally select government counsel, senior advocates (`*`), sentence options, and custom text.
5. Click **Export — बहस समावेश गर्नुहोस्**. The output enters the editable document body, at the current paragraph when a body cursor was selected, otherwise at the beginning. Re-export replaces the previous generated passage without replacing the surrounding body text.
6. Click **आदेशसहित** beside **बहससहित**, choose **आदेशको वर्ग** and its dependent **आदेशको व्यहोरा**, review the text, and click **Export — आदेश समावेश गर्नुहोस्**. The order enters below the imported बहस. Importing बहस later also keeps it above the order. Re-export replaces only the previously imported order.
7. Save, copy, print, or download `.docx` using the existing preview tools. Save also retains the form input for that case.

The inherited form labels replace generic Party 1/Party 2 headings. Existing KDC filtering, preparation fields, preview formatting, downloads, and synchronization remain available. Draft storage has a separate prefix to keep this project’s drafts independent.

Order choices and their supplied text are retained in `adesh-catalog.json`, imported from `ShivaPrasadAcharya/ordergeneratorfromcauselist`. All 20 categories and 68 dropdown choices are retained; empty source choices remain visible with Export disabled. TXT/JSON and Word paragraphs are included as editable order text.

## Data and deployment

`advocatedata.json` is the canonical local data source. GitHub Actions validates it, generates the JavaScript dataset, builds `dist/`, and publishes using GitHub Pages. Select **GitHub Actions** as the Pages source in repository settings.

Build locally with `python3 scripts/build_site.py`, then serve `dist/` with a static HTTP server. No framework installation is needed for the website.

Upstream source snapshots: KDC `606ec6c9ee9b198e3657221f164842a8f2eceda7` (tree); Bahas Generator `000b3323e0a541d72e7c482c02184ab01f3936e9` (tree).
