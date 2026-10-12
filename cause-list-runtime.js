!(function () {
  "use strict";
  const bahasFormUrl = new URL("bahas.html", document.currentScript.src || document.baseURI).href;
  const adeshCatalogUrl = new URL("adesh-catalog.json?v=1", document.currentScript.src || document.baseURI).href;
  if (!document.documentElement.dataset.cobRuntimeLoaded) {
    document.documentElement.dataset.cobRuntimeLoaded = "1";
    var e = {},
      t = document.getElementById("cause-list-config");
    try {
      e = JSON.parse((t && t.textContent) || "{}");
    } catch (e) {
      console.error("Invalid cause-list config", e);
    }
    window.openLocalCauseList = function (e) {
      e && e.preventDefault();
      var t,
        n = document.getElementById("pesi_date"),
        a = ((t = n && n.value),
        String(t || "").replace(/[०-९]/g, function (e) {
          return String("०१२३४५६७८९".indexOf(e));
        })).replace(/\D/g, "");
      return /^\d{8}$/.test(a)
        ? ((window.location.href = "index" + a + ".html"), !1)
        : (alert("मिति YYYY-MM-DD ढाँचामा लेख्नुहोस्।"), n && n.focus(), !1);
    };
    var n = document.getElementById("form1");
    (n &&
      ((n.action = "#"),
      (n.method = "get"),
      (n.onsubmit = window.openLocalCauseList)),
      (function (e) {
        const t = e || {},
          n = "[उपलब्ध छैन]",
          a = "०१२३४५६७८९",
          o = [
            "वैशाख",
            "जेठ",
            "असार",
            "साउन",
            "भदौ",
            "असोज",
            "कात्तिक",
            "मंसिर",
            "पुस",
            "माघ",
            "फागुन",
            "चैत",
          ],
          r = function (e) {
            return String(e || "")
              .replace(/[\u200B-\u200D\uFEFF]/g, "")
              .replace(/\u00A0/g, " ")
              .replace(/\s+/g, " ")
              .trim();
          },
          c = function (e) {
            return r(e)
              .replace(/[\s\u0964\u0965.,:;()\[\]{}\-_/'"]+/g, "")
              .toLowerCase();
          },
          i = function (e, t) {
            return t.some(function (t) {
              return c(e).includes(c(t));
            });
          },
          s = function (e) {
            return String(e || "").replace(/[&<>"']/g, function (e) {
              return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
              }[e];
            });
          },
          l = function (e) {
            return String(e || "").replace(/[०-९]/g, function (e) {
              return String(a.indexOf(e));
            });
          },
          u = function (e) {
            return String(e || "").replace(/\d/g, function (e) {
              return a[Number(e)];
            });
          },
          d = function (e) {
            const t = l(e)
              .replace(/[।./]/g, "-")
              .match(/(?:^|\D)(\d{4})-(\d{1,2})-(\d{1,2})(?:\D|$)/);
            return t
              ? u(
                  t[1] +
                    "।" +
                    String(Number(t[2])).padStart(2, "0") +
                    "।" +
                    String(Number(t[3])).padStart(2, "0"),
                )
              : "";
          },
          p = function (e) {
            const t = (function (e) {
              const t = l(d(e))
                .replace(/[।./]/g, "-")
                .match(/^(\d{4})-(\d{2})-(\d{2})$/);
              return t
                ? { year: Number(t[1]), month: Number(t[2]), day: Number(t[3]) }
                : null;
            })(e);
            if (!t) return "इति संवत् … साल … महिना … गते रोज … शुभम्";
            let n = "…";
            try {
              const e =
                window.NepaliDate &&
                (window.NepaliDate.default || window.NepaliDate);
              "function" == typeof e &&
                (n = u(new e(t.year, t.month - 1, t.day).getDay() + 1));
            } catch (e) {
              n = "…";
            }
            return (
              "इति संवत् " +
              u(t.year) +
              " साल " +
              (o[t.month - 1] || "…") +
              " महिना " +
              u(t.day) +
              " गते रोज " +
              n +
              " शुभम्"
            );
          },
          m = function (e) {
            const t = r(e),
              a = t.match(/[\(（]\s*([^\(\)（）]+?)\s*[\)）]/);
            return {
              caseNo: r(a ? t.replace(a[0], " ") : t) || n,
              registrationNo: a ? r(a[1]) : n,
            };
          },
          f = function (e) {
            return /(^|[-\s])FN($|[-\s])/i.test(l(e));
          },
          b = document.createElement("div");
        ((b.className = "cob-backdrop"),
          (b.innerHTML =
            '<section class="cob-modal" role="dialog" aria-modal="true" aria-labelledby="cobTitle"><header class="cob-head"><h2 id="cobTitle">नेपाली अदालती आदेश/फैसला</h2><div class="cob-import-actions"><button type="button" id="cobBahas" class="cob-btn cob-bahas-link" aria-haspopup="dialog">⚖ बहससहित</button><button type="button" id="cobAdesh" class="cob-btn cob-adesh-link" aria-haspopup="dialog">📄 आदेशसहित</button></div><button class="cob-close" type="button" aria-label="बन्द गर्नुहोस्">×</button></header><div class="cob-body"><div class="cob-controls"><div class="cob-field"><label for="cobType">कागजातको प्रकार</label><select id="cobType"><option>आदेश</option><option>अन्तिम आदेश</option><option>फैसला</option><option>कसूर_सजाय</option></select></div><div class="cob-field"><label for="cobVersusLayout">विरुद्ध खण्ड</label><select id="cobVersusLayout"><option value="leader">ट्याब लिडरसहित</option><option value="stacked">ट्याब लिडरबिना</option></select></div><div class="cob-field"><label for="cobJudge">श्रीमान्</label><select id="cobJudge"></select></div><div class="cob-field cob-wide"><label for="cobPartyStatus">पक्षहरूको हैसियत</label><div class="cob-party-control"><select id="cobPartyStatus"><option value="वादी|प्रतिवादी">वादी, प्रतिवादी</option><option value="निवेदक|विपक्षी">निवेदक, विपक्षी</option><option value="पुनरावेदक|प्रत्यर्थी">पुनरावेदक, प्रत्यर्थी</option><option value="निवेदक/वादी|विपक्षी/प्रतिवादी">निवेदक/वादी, विपक्षी/प्रतिवादी</option><option value="निवेदक/प्रतिवादी|विपक्षी/वादी">निवेदक/प्रतिवादी, विपक्षी/वादी</option><option value="निवेदक/वादी|विपक्षी">निवेदक/वादी, विपक्षी</option><option value="निवेदक/प्रतिवादी|विपक्षी">निवेदक/प्रतिवादी, विपक्षी</option><option value="निवेदक|विपक्षी/वादी">निवेदक, विपक्षी/वादी</option><option value="निवेदक|विपक्षी/प्रतिवादी">निवेदक, विपक्षी/प्रतिवादी</option><option value="पुनरावेदक/वादी|प्रत्यर्थी/प्रतिवादी">पुनरावेदक/वादी, प्रत्यर्थी/प्रतिवादी</option><option value="पुनरावेदक/प्रतिवादी|प्रत्यर्थी/वादी">पुनरावेदक/प्रतिवादी, प्रत्यर्थी/वादी</option></select><button type="button" class="cob-reverse" id="cobReverse" data-active="0" aria-pressed="false"><span>Reverse</span><span class="cob-reverse-mark" id="cobReverseMark" aria-hidden="true">✕</span></button></div></div><div class="cob-summary" id="cobSummary" aria-label="मुद्दाको स्वतः प्राप्त विवरण"></div><div class="cob-field cob-wide"><label for="cobRemarks">कैफियत</label><textarea id="cobRemarks" placeholder="आदेश वा फैसलाको व्यहोरा यहाँ लेख्नुहोस्"></textarea></div></div><p class="cob-note">मुद्दाको विवरण source row बाट स्वतः लिइन्छ। कैफियत मात्र सम्पादनयोग्य content field हो।</p><div class="cob-actions"><button type="button" class="cob-btn cob-primary" id="cobGenerate">मस्यौदा तयार गर्नुहोस्</button><button type="button" class="cob-btn" id="cobTools">Tools</button><button type="button" class="cob-btn" id="cobSave">सुरक्षित गर्नुहोस्</button><button type="button" class="cob-btn" id="cobCopy">Copy</button><button type="button" class="cob-btn" id="cobDocx">Download .docx</button><button type="button" class="cob-btn" id="cobPrint">Print</button><span class="cob-save-status" id="cobSaveStatus" role="status" aria-live="polite"></span></div><aside class="cob-tools-panel" id="cobToolsPanel" aria-label="Preview formatting tools" hidden><div class="cob-tools-head"><strong>Preview Tools</strong><button type="button" class="cob-tools-close" aria-label="Tools बन्द गर्नुहोस्">×</button></div><p class="cob-tools-help">Cursor राख्नुहोस् वा line/paragraph छान्नुहोस्। Ascend/Descend ले bullet नहटाई indent मात्र बदल्छ।</p><div class="cob-tools-grid"><button type="button" data-cob-tool="tab-remove" title="Tab घटाई माथिल्लो indent level मा लैजानुहोस्">← Ascend indent</button><button type="button" data-cob-tool="tab-add" title="Tab थपेर तल्लो indent level मा लैजानुहोस्">Descend indent →</button><button type="button" data-cob-tool="bullet-add">+ Bullet</button><button type="button" data-cob-tool="bullet-remove">− Bullet</button><button type="button" data-cob-tool="subbullet-add">+ Subbullet</button><button type="button" data-cob-tool="subbullet-remove">− Subbullet</button></div><label class="cob-size-control" for="cobFontSize"><span>Text size</span><output id="cobFontSizeValue">13 pt</output><input id="cobFontSize" type="range" min="9" max="24" step="0.5" value="13"></label><p class="cob-tools-status" id="cobToolsStatus" aria-live="polite"></p></aside><div class="cob-draft-wrap" id="cobDraftWrap"><div class="cob-draft" id="cobDraft" contenteditable="true" spellcheck="true" data-cob-font-size="13"></div></div></div></section>'),
          document.body.appendChild(b));
        const w = b.querySelector("#cobDraft"),
          h = b.querySelector("#cobRemarks"),
          g = b.querySelector("#cobType"),
          y = b.querySelector("#cobJudge"),
          v = b.querySelector("#cobPartyStatus"),
          versusSelect = b.querySelector("#cobVersusLayout"),
          x = b.querySelector("#cobReverse"),
          C = b.querySelector("#cobReverseMark"),
          S = b.querySelector("#cobSummary"),
          L = b.querySelector("#cobSaveStatus"),
          N = b.querySelector("#cobSave"),
          E = b.querySelector("#cobCopy"),
          k = document.createElement("button");
        const toolsButton = b.querySelector("#cobTools"),
          toolsPanel = b.querySelector("#cobToolsPanel"),
          fontSizeInput = b.querySelector("#cobFontSize"),
          fontSizeValue = b.querySelector("#cobFontSizeValue"),
          toolsStatus = b.querySelector("#cobToolsStatus");
        ((k.type = "button"),
          (k.className = "cob-btn"),
          (k.id = "cobTxt"),
          b.querySelector("#cobDocx").before(k),
          b.querySelector("#cobGenerate").remove());
        const reverseOptions = document.createElement("div");
        ((reverseOptions.className = "cob-reverse-options"),
          (reverseOptions.id = "cobReverseOptions"),
          reverseOptions.setAttribute("role", "group"),
          reverseOptions.setAttribute("aria-label", "पक्ष उल्टाउने विकल्प"),
          (reverseOptions.innerHTML =
            '<button type="button" data-reverse-mode="none" aria-pressed="true"><span>सामान्य</span><small>नउल्टाउने</small></button><button type="button" data-reverse-mode="partial" aria-pressed="false"><span>Partial reverse</span><small>नाम मात्र</small></button><button type="button" data-reverse-mode="full" aria-pressed="false"><span>Full reverse</span><small>नाम + हैसियत</small></button>'),
          x.replaceWith(reverseOptions),
          (L.hidden = !0),
          L.removeAttribute("role"),
          L.removeAttribute("aria-live"));
        const iconPaths = {
          save: '<path d="M4 3h13l4 4v14H3V3h1zm3 2v6h10V5H7zm0 10v4h10v-4H7z"/>',
          copy: '<path d="M8 7h11v14H8V7zm-3-4h11v2H7a1 1 0 0 0-1 1v11H4V4a1 1 0 0 1 1-1z"/>',
          txt: '<path d="M5 2h10l4 4v16H5V2zm9 2v4h4" fill="none" stroke="currentColor" stroke-width="2"/><text x="7" y="17" font-size="6" font-weight="800">TXT</text>',
          docx: '<path d="M5 2h10l4 4v16H5V2zm9 2v4h4" fill="none" stroke="currentColor" stroke-width="2"/><path d="m8 12 1.5 6 1.5-4 1.5 4 1.5-6" fill="none" stroke="currentColor" stroke-width="1.5"/>',
          print:
            '<path d="M7 3h10v5H7V3zm0 13h10v5H7v-5zm-3-7h16a2 2 0 0 1 2 2v6h-3v-3H5v3H2v-6a2 2 0 0 1 2-2z"/>',
          tools:
            '<path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5L4 17l3 3 8.3-8.3a4 4 0 0 0 5-5L18 9l-2.4-2.4 2.3-2.3a4 4 0 0 0-3.2 2z"/>',
        };
        function setIconButton(button, label, icon) {
          (button.classList.add("cob-icon-btn"),
            button.setAttribute("aria-label", label),
            (button.title = label),
            (button.dataset.defaultLabel = label),
            (button.innerHTML =
              '<svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">' +
              icon +
              '</svg><span class="cob-tooltip">' +
              label +
              "</span>"));
        }
        (setIconButton(toolsButton, "Tools", iconPaths.tools),
          setIconButton(N, "Save", iconPaths.save),
          N.classList.add("cob-primary"),
          setIconButton(E, "Copy", iconPaths.copy),
          setIconButton(k, "Download .txt", iconPaths.txt),
          setIconButton(
            b.querySelector("#cobDocx"),
            "Download .docx",
            iconPaths.docx,
          ),
          setIconButton(b.querySelector("#cobPrint"), "Print", iconPaths.print),
          [y.closest(".cob-field"), h.closest(".cob-field"), S].forEach(
            function (e) {
              e.remove();
            },
          ),
          (b.querySelector(".cob-note").textContent =
            "श्रीमान् र मुद्दाको विवरण source row बाट स्वतः लिइन्छ। तलको preview मा व्यहोरा सिधै सम्पादन गर्नुहोस्।"));
        let T = null,
          j = "none",
          A = "",
          savedDraftRange = null;
        let bahasFormState = null;
        const bahasStates = new Map();
        const bahasButton = b.querySelector("#cobBahas");
        const bahasOverlay = document.createElement("div");
        bahasOverlay.className = "cob-bahas-overlay";
        bahasOverlay.hidden = true;
        bahasOverlay.innerHTML = '<section class="cob-bahas-dialog" role="dialog" aria-modal="true" aria-labelledby="cobBahasTitle"><header><div><h3 id="cobBahasTitle">बहससहित</h3><p>कानून व्यवसायीको विवरण राखेर Export गर्नुहोस्।</p></div><button type="button" class="cob-bahas-close" aria-label="बहस form बन्द गर्नुहोस्">×</button></header><div class="cob-bahas-frame-wrap"></div></section>';
        b.appendChild(bahasOverlay);
        let bahasFrame = null;
        let bahasSession = "";
        let bahasRange = null;
        function bahasRoles() {
          const roles = String(v.value || "वादी|प्रतिवादी").split("|");
          return j === "full" ? roles.reverse() : roles;
        }
        function bahasInit() {
          if (!bahasFrame) return;
          const marked = w.querySelector("[data-cob-bahas-form]");
          if (!bahasFormState && marked) {
            try { bahasFormState = JSON.parse(decodeURIComponent(marked.dataset.cobBahasForm)); } catch (_) {}
          }
          bahasFrame.contentWindow.postMessage({
            type: "kdc-bahas-init", session: bahasSession,
            roles: bahasRoles(), caseNo: T ? m(T.rawCase).caseNo : "",
            state: bahasFormState
          }, "*");
        }
        function closeBahas() {
          if (bahasOverlay.hidden) return;
          bahasOverlay.hidden = true;
          b.querySelector(".cob-modal").inert = false;
          bahasFrame?.remove(); bahasFrame = null; bahasSession = "";
          bahasButton.focus();
        }
        function openBahas() {
          if (!T) return;
          rememberDraftRange();
          bahasRange = savedDraftRange ? savedDraftRange.cloneRange() : null;
          bahasSession = Array.from(crypto.getRandomValues(new Uint32Array(4))).join("-");
          bahasFrame = document.createElement("iframe");
          bahasFrame.title = "बहस तयार गर्ने form";
          bahasFrame.src = bahasFormUrl;
          bahasFrame.addEventListener("load", bahasInit, {once: true});
          bahasOverlay.querySelector(".cob-bahas-frame-wrap").replaceChildren(bahasFrame);
          bahasOverlay.hidden = false;
          b.querySelector(".cob-modal").inert = true;
          bahasOverlay.querySelector(".cob-bahas-close").focus();
        }
        async function insertBahas(text, state) {
          const body = w.querySelector("[data-cob-main-body='1']");
          if (previewEnhancer && body?.querySelector("[data-cob-bahas='1']")) {
            const originalKey = A;
            closeBahas();
            text = await previewEnhancer.reviewImport("bahas", text);
            if (text === null || A !== originalKey) return;
          }
          if (!body || !text.trim()) return;
          const fragment = document.createDocumentFragment();
          text.replace(/\r/g, "").split(/\n\s*\n/).filter(part => part.trim()).forEach(function (part, index) {
            const template = document.createElement("template");
            template.innerHTML = V(part.replace(/\s*\n\s*/g, " ").trim(), {
              firstLine: ["फैसला", "कसूर_सजाय"].includes(g.value)
            });
            const paragraph = template.content.firstElementChild;
            paragraph.dataset.cobBahas = "1";
            if (index === 0) paragraph.dataset.cobBahasForm = encodeURIComponent(JSON.stringify(state));
            fragment.appendChild(paragraph);
          });
          const previous = Array.from(body.querySelectorAll("[data-cob-bahas='1']"));
          let anchor = previous.length ? previous[0] : null;
          if (!anchor && bahasRange && body.contains(bahasRange.startContainer)) {
            let block = draftBlockForNode(bahasRange.startContainer);
            if (block && body.contains(block)) {
              while (block.parentElement !== body) block = block.parentElement;
              anchor = block.nextSibling;
            }
          } else if (!anchor) anchor = body.firstChild;
          const onlyPlaceholder = body.children.length === 1 && body.textContent.trim() === "यहाँ आदेश वा फैसलाको व्यहोरा लेख्नुहोस्।";
          if (onlyPlaceholder) { body.replaceChildren(fragment); }
          else {
            body.insertBefore(fragment, anchor);
            previous.forEach(node => node.remove());
          }
          keepAdeshBelowBahas(body);
          previewEnhancer?.imported("bahas");
          bahasFormState = state;
          if (A) bahasStates.set(A, state);
          closeBahas();
          savedDraftRange = null; bahasRange = null;
          w.dispatchEvent(new Event("input", {bubbles: true}));
          w.focus();
          const first = body.querySelector("[data-cob-bahas='1']");
          first?.scrollIntoView?.({block: "nearest", behavior: "smooth"});
          bahasButton.textContent = "✓ बहस समावेश भयो";
          clearTimeout(bahasButton._confirmTimer);
          bahasButton._confirmTimer = setTimeout(() => { bahasButton.textContent = "⚖ बहससहित"; }, 1600);
        }
        bahasButton.addEventListener("click", openBahas);
        bahasOverlay.querySelector(".cob-bahas-close").addEventListener("click", closeBahas);
        bahasOverlay.addEventListener("click", event => { if (event.target === bahasOverlay) closeBahas(); });
        document.addEventListener("keydown", event => {
          if (bahasOverlay.hidden) return;
          if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); closeBahas(); }
          if (event.key === "Tab" && document.activeElement === bahasOverlay.querySelector(".cob-bahas-close") && event.shiftKey) {
            event.preventDefault(); bahasFrame?.focus();
          }
        }, true);
        window.addEventListener("message", event => {
          const message = event.data;
          if (!bahasFrame || event.source !== bahasFrame.contentWindow || !message || message.session !== bahasSession) return;
          if (![new URL(bahasFormUrl).origin, "null"].includes(event.origin)) return;
          if (message.type === "kdc-bahas-state" && message.state && typeof message.state === "object") {
            bahasFormState = message.state;
            if (A) bahasStates.set(A, message.state);
          }
          if (message.type === "kdc-bahas-close") closeBahas();
          if (message.type === "kdc-bahas-export" && typeof message.text === "string" && message.text.length <= 100000 && message.state && typeof message.state === "object") {
            insertBahas(message.text, message.state);
          }
        });
        let adeshFormState = null;
        const adeshStates = new Map();
        let adeshCatalog = null;
        let adeshCatalogPromise = null;
        let adeshOpenVersion = 0;
        const adeshButton = b.querySelector("#cobAdesh");
        const adeshOverlay = document.createElement("div");
        adeshOverlay.className = "cob-bahas-overlay cob-adesh-overlay";
        adeshOverlay.hidden = true;
        adeshOverlay.innerHTML = '<section class="cob-bahas-dialog cob-adesh-dialog" role="dialog" aria-modal="true" aria-labelledby="cobAdeshTitle"><header><div><h3 id="cobAdeshTitle">आदेशसहित</h3><p>आदेशको वर्ग र व्यहोरा छान्नुहोस्। Export गर्दा बहसभन्दा तल समावेश हुन्छ।</p></div><button type="button" class="cob-bahas-close" aria-label="आदेश form बन्द गर्नुहोस्">×</button></header><div class="cob-adesh-body"><p id="cobAdeshContext" class="cob-adesh-context"></p><div class="cob-adesh-selects"><div class="cob-field"><label for="cobAdeshCategory">आदेशको वर्ग</label><select id="cobAdeshCategory" disabled><option value="">आदेशको वर्ग रोज्नुहोस्</option></select></div><div class="cob-field"><label for="cobAdeshOrder">आदेशको व्यहोरा</label><select id="cobAdeshOrder" disabled><option value="">पहिले आदेशको वर्ग रोज्नुहोस्</option></select></div></div><label for="cobAdeshText" class="cob-adesh-text-label">छानिएको आदेश</label><textarea id="cobAdeshText" readonly placeholder="आदेश छानेपछि व्यहोरा यहाँ देखिन्छ।"></textarea><p class="cob-adesh-status" id="cobAdeshStatus" role="status" aria-live="polite"></p></div><footer class="cob-adesh-footer"><button type="button" class="cob-btn" id="cobAdeshCancel">फर्कनुहोस्</button><button type="button" class="cob-btn cob-primary" id="cobAdeshExport" disabled>Export — आदेश समावेश गर्नुहोस्</button></footer></section>';
        b.appendChild(adeshOverlay);
        const adeshCategory = adeshOverlay.querySelector("#cobAdeshCategory");
        const adeshOrder = adeshOverlay.querySelector("#cobAdeshOrder");
        const adeshText = adeshOverlay.querySelector("#cobAdeshText");
        const adeshStatus = adeshOverlay.querySelector("#cobAdeshStatus");
        const adeshExport = adeshOverlay.querySelector("#cobAdeshExport");
        function selectedAdesh() {
          const category = adeshCatalog?.categories.find(item => item.id === adeshCategory.value);
          return category?.orders.find(item => item.id === adeshOrder.value) || null;
        }
        function rememberAdeshState() {
          adeshFormState = {categoryId: adeshCategory.value, orderId: adeshOrder.value};
          if (A) adeshStates.set(A, adeshFormState);
        }
        function updateAdeshText() {
          const order = selectedAdesh();
          adeshText.value = order ? order.text : "";
          adeshExport.disabled = !order || !order.available || !order.text.trim();
          adeshStatus.textContent = order && !order.available ? (order.message || "यो आदेशको व्यहोरा खाली छ। अर्को आदेश छान्नुहोस्।") : "";
        }
        function updateAdeshOrders(orderId) {
          const category = adeshCatalog?.categories.find(item => item.id === adeshCategory.value);
          adeshOrder.replaceChildren(new Option(category ? "आदेशको व्यहोरा रोज्नुहोस्" : "पहिले आदेशको वर्ग रोज्नुहोस्", ""));
          adeshOrder.disabled = !category;
          if (category) category.orders.slice().sort((a, b) => a.label.localeCompare(b.label, "ne")).forEach(order => {
            const option = new Option(order.label, order.id);
            option.title = order.keywords || order.label;
            adeshOrder.add(option);
          });
          if (orderId && Array.from(adeshOrder.options).some(option => option.value === orderId)) adeshOrder.value = orderId;
          updateAdeshText();
        }
        async function loadAdeshCatalog() {
          if (adeshCatalog) return adeshCatalog;
          if (!adeshCatalogPromise) adeshCatalogPromise = fetch(adeshCatalogUrl).then(response => {
            if (!response.ok) throw new Error("आदेशको सूची ल्याउन सकिएन। फेरि खोल्नुहोस्।");
            return response.json();
          }).then(catalog => {
            if (!Array.isArray(catalog.categories) || !catalog.categories.length || catalog.categories.some(category => typeof category.id !== "string" || typeof category.label !== "string" || !Array.isArray(category.orders) || category.orders.some(order => typeof order.id !== "string" || typeof order.label !== "string" || typeof order.text !== "string"))) throw new Error("आदेशको सूची ल्याउन सकिएन। फेरि खोल्नुहोस्।");
            adeshCatalog = catalog;
            return catalog;
          }).catch(error => { adeshCatalogPromise = null; throw error; });
          return adeshCatalogPromise;
        }
        async function openAdesh() {
          if (!T) return;
          const version = ++adeshOpenVersion;
          adeshOverlay.hidden = false;
          b.querySelector(".cob-modal").inert = true;
          adeshCategory.disabled = true; adeshOrder.disabled = true; adeshExport.disabled = true;
          adeshText.value = ""; adeshStatus.textContent = "आदेशको सूची ल्याउँदैछ…";
          adeshOverlay.querySelector("#cobAdeshContext").textContent = m(T.rawCase).caseNo + " · " + bahasRoles().join(" / ");
          adeshOverlay.querySelector(".cob-bahas-close").focus();
          const imported = w.querySelector("[data-cob-adesh='1']");
          if (!adeshFormState && imported) adeshFormState = {categoryId: imported.dataset.cobAdeshCategory || "", orderId: imported.dataset.cobAdeshOrder || ""};
          try {
            const catalog = await loadAdeshCatalog();
            if (version !== adeshOpenVersion || adeshOverlay.hidden) return;
            adeshCategory.replaceChildren(new Option("आदेशको वर्ग रोज्नुहोस्", ""));
            catalog.categories.slice().sort((a, b) => a.label.localeCompare(b.label, "ne")).forEach(category => adeshCategory.add(new Option(category.label, category.id)));
            adeshCategory.disabled = false;
            if (adeshFormState?.categoryId && Array.from(adeshCategory.options).some(option => option.value === adeshFormState.categoryId)) adeshCategory.value = adeshFormState.categoryId;
            updateAdeshOrders(adeshFormState?.orderId);
            adeshStatus.textContent = selectedAdesh()?.available === false ? selectedAdesh().message : "";
            adeshCategory.focus();
          } catch (error) {
            if (version === adeshOpenVersion && !adeshOverlay.hidden) adeshStatus.textContent = error.message;
          }
        }
        function closeAdesh() {
          if (adeshOverlay.hidden) return;
          ++adeshOpenVersion;
          adeshOverlay.hidden = true;
          b.querySelector(".cob-modal").inert = false;
          adeshButton.focus();
        }
        function topBodyBlock(element, body) {
          let block = element;
          while (block && block.parentElement !== body) block = block.parentElement;
          return block;
        }
        function keepAdeshBelowBahas(body) {
          const bahas = Array.from(body.querySelectorAll("[data-cob-bahas='1']"));
          const adesh = Array.from(body.querySelectorAll("[data-cob-adesh='1']"));
          if (!bahas.length || !adesh.length) return;
          const anchorBlock = topBodyBlock(bahas[bahas.length - 1], body);
          if (!anchorBlock) return;
          let anchor = anchorBlock;
          // Keep surrounding text in place; move only the imported आदेश paragraphs.
          adesh.forEach(paragraph => { if (!paragraph.contains(anchorBlock)) { anchor.after(paragraph); anchor = paragraph; } });
        }
        async function insertAdesh() {
          const order = selectedAdesh();
          const body = w.querySelector("[data-cob-main-body='1']");
          if (!body || !order || !order.available || !order.text.trim()) return;
          let orderText = order.text;
          if (previewEnhancer && body.querySelector("[data-cob-adesh='1']")) {
            const originalKey = A;
            closeAdesh();
            orderText = await previewEnhancer.reviewImport("adesh", orderText);
            if (orderText === null || A !== originalKey) return;
          }
          const fragment = document.createDocumentFragment();
          orderText.replace(/\r/g, "").split(/\n+/).filter(part => part.trim()).forEach((part, index) => {
            const template = document.createElement("template");
            template.innerHTML = V(part.trim(), {firstLine: ["फैसला", "कसूर_सजाय"].includes(g.value)});
            const paragraph = template.content.firstElementChild;
            paragraph.dataset.cobAdesh = "1";
            if (index === 0) {
              paragraph.dataset.cobAdeshCategory = adeshCategory.value;
              paragraph.dataset.cobAdeshOrder = order.id;
            }
            fragment.appendChild(paragraph);
          });
          const previous = Array.from(body.querySelectorAll("[data-cob-adesh='1']"));
          const bahas = Array.from(body.querySelectorAll("[data-cob-bahas='1']"));
          const lastBahas = bahas.length ? topBodyBlock(bahas[bahas.length - 1], body) : null;
          const anchor = lastBahas ? lastBahas.nextSibling : (previous.length ? topBodyBlock(previous[0], body) : body.firstChild);
          const onlyPlaceholder = body.children.length === 1 && body.textContent.trim() === "यहाँ आदेश वा फैसलाको व्यहोरा लेख्नुहोस्।";
          if (onlyPlaceholder) body.replaceChildren(fragment);
          else { body.insertBefore(fragment, anchor); previous.forEach(node => node.remove()); }
          rememberAdeshState();
          keepAdeshBelowBahas(body);
          previewEnhancer?.imported("adesh");
          closeAdesh(); savedDraftRange = null;
          w.dispatchEvent(new Event("input", {bubbles: true}));
          w.focus();
          body.querySelector("[data-cob-adesh='1']")?.scrollIntoView?.({block: "nearest", behavior: "smooth"});
          adeshButton.textContent = "✓ आदेश समावेश भयो";
          clearTimeout(adeshButton._confirmTimer);
          adeshButton._confirmTimer = setTimeout(() => { adeshButton.textContent = "📄 आदेशसहित"; }, 1600);
        }
        adeshButton.addEventListener("click", openAdesh);
        adeshCategory.addEventListener("change", () => { updateAdeshOrders(); rememberAdeshState(); });
        adeshOrder.addEventListener("change", () => { updateAdeshText(); rememberAdeshState(); });
        adeshExport.addEventListener("click", insertAdesh);
        adeshOverlay.querySelector(".cob-bahas-close").addEventListener("click", closeAdesh);
        adeshOverlay.querySelector("#cobAdeshCancel").addEventListener("click", closeAdesh);
        adeshOverlay.addEventListener("click", event => { if (event.target === adeshOverlay) closeAdesh(); });
        document.addEventListener("keydown", event => {
          if (adeshOverlay.hidden) return;
          if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); closeAdesh(); }
          if (event.key === "Tab") {
            const controls = Array.from(adeshOverlay.querySelectorAll("button,select,textarea")).filter(element => !element.disabled);
            const first = controls[0], last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          }
        }, true);
        const R = Array.isArray(t.judges) ? t.judges.slice() : [];
        function rememberDraftRange() {
          const selection = getSelection();
          if (!selection || !selection.rangeCount) return;
          const range = selection.getRangeAt(0);
          if (w.contains(range.commonAncestorContainer))
            savedDraftRange = range.cloneRange();
        }
        function restoreDraftRange() {
          if (!savedDraftRange) return null;
          try {
            const selection = getSelection();
            selection.removeAllRanges();
            selection.addRange(savedDraftRange);
            return savedDraftRange;
          } catch (error) {
            savedDraftRange = null;
            return null;
          }
        }
        function draftBlockForNode(node) {
          const element =
            node && 1 === node.nodeType ? node : node && node.parentElement;
          if (!element || !w.contains(element)) return null;
          const block = element.closest("[data-docx-p],p,li,.cob-main-body > div");
          return block && w.contains(block) && block !== w ? block : null;
        }
        function selectedDraftBlocks() {
          const range = restoreDraftRange();
          if (!range) return [];
          if (range.collapsed) {
            const block = draftBlockForNode(range.startContainer);
            return block ? [block] : [];
          }
          return Array.from(
            w.querySelectorAll("[data-docx-p],li,.cob-main-body > div"),
          ).filter(function (block) {
            try {
              return range.intersectsNode(block);
            } catch (error) {
              return false;
            }
          });
        }
        function setToolsStatus(message) {
          toolsStatus.textContent = message || "";
        }
        let copiedFormat = null;
        const painter = document.createElement("fieldset");
        painter.className = "cob-format-painter";
        painter.innerHTML = '<legend>Format Painter</legend><button type="button" id="cobCopyFormat">Copy format</button><button type="button" id="cobApplyFormat" disabled>Apply format</button><small>पहिले source text मा cursor राखेर Copy format गर्नुहोस्। त्यसपछि target text छानेर Apply format गर्नुहोस्। Text नछानेमा पूरा paragraph मा लागू हुन्छ।</small>';
        toolsPanel.querySelector(".cob-size-control").before(painter);
        const inlineFormatProperties = ["fontFamily", "fontSize", "fontWeight", "fontStyle", "textDecoration", "color", "backgroundColor", "verticalAlign"],
          paragraphFormatProperties = ["textAlign", "lineHeight", "marginTop", "marginBottom"];
        painter.querySelectorAll("button").forEach(function (button) { button.addEventListener("mousedown", function (event) { event.preventDefault(); }); });
        painter.querySelector("#cobCopyFormat").addEventListener("click", function () {
          const range = restoreDraftRange();
          if (!range || !w.contains(range.startContainer)) { setToolsStatus("पहिले source text मा cursor राख्नुहोस् वा text छान्नुहोस्।"); return; }
          let source = range.startContainer.nodeType === 1 ? range.startContainer.childNodes[range.startOffset] || range.startContainer : range.startContainer;
          if (source.nodeType !== 1) source = source.parentElement;
          const block = draftBlockForNode(source), style = getComputedStyle(source), blockStyle = getComputedStyle(block || source);
          copiedFormat = { inline: {}, paragraph: {} };
          inlineFormatProperties.forEach(function (key) { copiedFormat.inline[key] = style[key]; });
          paragraphFormatProperties.forEach(function (key) { copiedFormat.paragraph[key] = blockStyle[key]; });
          painter.querySelector("#cobApplyFormat").disabled = false;
          setToolsStatus("Format copied। अब target text छानेर Apply format गर्नुहोस्।");
        });
        painter.querySelector("#cobApplyFormat").addEventListener("click", function () {
          const range = restoreDraftRange();
          if (!copiedFormat || !range || !w.contains(range.commonAncestorContainer)) { setToolsStatus("पहिले format copy गरी target text छान्नुहोस्।"); return; }
          const blocks = selectedDraftBlocks();
          if (!blocks.length) return;
          const target = range.cloneRange();
          if (target.collapsed) target.selectNodeContents(blocks[0]);
          const walker = document.createTreeWalker(w, NodeFilter.SHOW_TEXT), texts = [];
          let node;
          while ((node = walker.nextNode())) {
            if (!node.nodeValue || node.parentElement.closest('[data-cob-list-marker],[contenteditable="false"]') || !target.intersectsNode(node)) continue;
            const start = node === target.startContainer ? target.startOffset : 0,
              end = node === target.endContainer ? target.endOffset : node.length;
            if (end > start) texts.push({ node: node, start: start, end: end });
          }
          texts.reverse().forEach(function (part) {
            const span = document.createElement("span");
            Object.assign(span.style, copiedFormat.inline);
            if (part.end < part.node.length) part.node.splitText(part.end);
            const text = part.start ? part.node.splitText(part.start) : part.node;
            text.parentNode.insertBefore(span, text); span.appendChild(text);
          });
          blocks.forEach(function (block) { Object.assign(block.style, copiedFormat.paragraph); });
          rememberDraftRange();
          w.dispatchEvent(new Event("input", { bubbles: true }));
          setToolsStatus("Format लागू भयो। Text र numbering यथावत् छन्।");
        });
        const numberingTools = document.createElement("fieldset");
        numberingTools.className = "cob-numbering-tools";
        numberingTools.innerHTML = `<legend>Auto numbering / Sub-numbering</legend>
          <label for="cobNumberStyle">Style</label><select id="cobNumberStyle"><option value="decimal">1, 2, 3</option><option value="hierarchical">1.1, 1.2, 1.3</option><option value="alpha">a, b, c</option><option value="ALPHA">A, B, C</option><option value="roman">i, ii, iii</option><option value="ROMAN">I, II, III</option></select>
          <label for="cobNumberStart">Start at</label><input id="cobNumberStart" value="1" autocomplete="off" aria-describedby="cobNumberHelp">
          <small id="cobNumberHelp">Start at: 1 वा 5; sub-numbering: 1.1 वा 2.3। Enter ले अर्को नम्बर थप्छ।</small>
          <button type="button" id="cobNumberApply">Apply numbering</button><button type="button" id="cobNumberRemove">Remove numbering</button>`;
        toolsPanel.querySelector(".cob-size-control").before(numberingTools);
        const numberStyle = numberingTools.querySelector("select"), numberStart = numberingTools.querySelector("input");
        numberStyle.add(new Option("१, २, ३", "nepali"));
        numberStyle.add(new Option("१.१, १.२, १.३", "nepali-hierarchical"));
        numberStyle.add(new Option("क, ख, ग", "nepali-alpha"));
        numberStyle.addEventListener("change", function () { numberStart.value = numberStyle.value.endsWith("hierarchical") ? "1.1" : "1"; });
        numberingTools.querySelectorAll("button").forEach(function (button) { button.addEventListener("mousedown", function (event) { event.preventDefault(); }); });
        function numberLabel(format, value) {
          if (format === "nepali" || format === "nepali-hierarchical") return String(value).replace(/\d/g, function (n) { return "०१२३४५६७८९"[Number(n)]; }) + ".";
          if (format === "nepali-alpha") {
            const letters = ["क","ख","ग","घ","ङ","च","छ","ज","झ","ञ","ट","ठ","ड","ढ","ण","त","थ","द","ध","न","प","फ","ब","भ","म","य","र","ल","व","श","ष","स","ह"];
            let label = "", index = Number(value);
            while (index > 0) { index--; label = letters[index % letters.length] + label; index = Math.floor(index / letters.length); }
            return label + ".";
          }
          if (format === "hierarchical") return value + ".";
          const n = Number(value);
          if (format === "decimal") return n + ".";
          if (format === "alpha" || format === "ALPHA") {
            let label = "", index = n;
            while (index > 0) { index--; label = String.fromCharCode(97 + index % 26) + label; index = Math.floor(index / 26); }
            return (format === "ALPHA" ? label.toUpperCase() : label) + ".";
          }
          let label = "", index = n;
          [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]].forEach(function (pair) { while (index >= pair[0]) { label += pair[1]; index -= pair[0]; } });
          return (format === "roman" ? label.toLowerCase() : label) + ".";
        }
        function refreshNumbering() {
          const groups = new Map();
          w.querySelectorAll('[data-cob-list="number"]').forEach(function (block) {
            const group = block.dataset.cobNumberGroup;
            let state = groups.get(group);
            if (!state) { state = { count: 0, start: block.dataset.cobNumberStart || "1", format: block.dataset.cobNumberStyle || "decimal" }; groups.set(group, state); }
            const parts = state.start.split("."), last = parts.length - 1;
            parts[last] = String(Number(parts[last]) + state.count++);
            let marker = listMarker(block);
            if (!marker) { setBlockList(block, "number"); marker = listMarker(block); }
            marker.textContent = numberLabel(state.format, parts.join(".")) + "\t";
            updateBlockIndent(block);
          });
        }
        numberingTools.querySelector("#cobNumberApply").addEventListener("click", function () {
          const blocks = selectedDraftBlocks(), start = numberStart.value.trim().replace(/[०-९]/g, function (n) { return "०१२३४५६७८९".indexOf(n); });
          const valid = numberStyle.value.endsWith("hierarchical") ? /^[1-9]\d*(?:\.[1-9]\d*)+$/.test(start) : /^[1-9]\d*$/.test(start);
          if (!valid || start.split(".").some(function (n) { return Number(n) > 3999; })) { setToolsStatus("Start at मा 1–3999 राख्नुहोस्; sub-numbering मा 1.1 जस्तै राख्नुहोस्।"); return; }
          if (!blocks.length) { setToolsStatus("पहिले paragraph छान्नुहोस् वा cursor राख्नुहोस्।"); return; }
          const group = "num-" + Date.now() + "-" + Math.random().toString(36).slice(2);
          blocks.forEach(function (block) { block.dataset.cobNumberGroup = group; block.dataset.cobNumberStart = start; block.dataset.cobNumberStyle = numberStyle.value; setBlockList(block, "number"); });
          refreshNumbering(); rememberDraftRange(); w.dispatchEvent(new Event("input", { bubbles: true })); setToolsStatus("Numbering लागू भयो। Enter ले अर्को नम्बर थप्छ।");
        });
        numberingTools.querySelector("#cobNumberRemove").addEventListener("click", function () {
          selectedDraftBlocks().forEach(function (block) { if (block.dataset.cobList === "number") setBlockList(block, "none"); });
          refreshNumbering(); w.dispatchEvent(new Event("input", { bubbles: true }));
        });
        w.addEventListener("input", refreshNumbering);
        function continuePreviousNumbering() {
          const blocks = selectedDraftBlocks();
          if (!blocks.length) { setToolsStatus("पहिले paragraph छान्नुहोस्।"); return; }
          let previous = blocks[0].previousElementSibling;
          while (previous && previous.dataset.cobList !== "number") previous = previous.previousElementSibling;
          if (!previous) { setToolsStatus("अघिल्लो numbered paragraph भेटिएन।"); return; }
          blocks.forEach(function (block) {
            block.dataset.cobNumberGroup = previous.dataset.cobNumberGroup;
            block.dataset.cobNumberStart = previous.dataset.cobNumberStart;
            block.dataset.cobNumberStyle = previous.dataset.cobNumberStyle;
            setBlockList(block, "number");
          });
          refreshNumbering();
          setToolsStatus("अघिल्लो numbering बाट निरन्तर भयो।");
        }
        function listMarker(block) {
          return Array.from(block.children).find(function (child) {
            return child.hasAttribute("data-cob-list-marker");
          });
        }
        function updateBlockIndent(block) {
          const tabLevel = Math.max(
              0,
              Math.min(6, Number(block.dataset.cobTab || 0)),
            ),
            listLevel =
              block.dataset.cobList === "number"
                ? (block.dataset.cobNumberStyle?.endsWith("hierarchical") ? (block.dataset.cobNumberStart || "1.1").split(".").length : 1)
                : "subbullet" === block.dataset.cobList
                ? 2
                : "bullet" === block.dataset.cobList
                  ? 1
                  : 0,
            totalLevel = tabLevel + listLevel;
          block.dataset.cobTab = String(tabLevel);
          block.dataset.docxLeft = String(totalLevel * 720);
          if (block.dataset.cobList === "number") {
            if (!block.dataset.cobNumberHanging) block.dataset.cobNumberOriginalIndent = block.style.textIndent || "";
            block.dataset.cobNumberHanging = "1";
            block.style.textIndent = "-36pt";
          } else if (block.dataset.cobNumberHanging) {
            block.style.textIndent = block.dataset.cobNumberOriginalIndent || "";
            delete block.dataset.cobNumberHanging; delete block.dataset.cobNumberOriginalIndent;
          }
          totalLevel
            ? (block.style.marginLeft = totalLevel * 36 + "pt")
            : block.style.removeProperty("margin-left");
          if (block.dataset.cobCustomIndent !== undefined) {
            const custom = Math.max(0, Number(block.dataset.cobCustomIndent) || 0);
            block.dataset.docxLeft = String(Math.round(custom * 20));
            block.style.marginLeft = custom + "pt";
          }
          if (block.dataset.cobCustomFirst !== undefined)
            block.style.textIndent = Number(block.dataset.cobCustomFirst) + "pt";
        }
        function setBlockList(block, mode) {
          let marker = listMarker(block);
          if (mode !== "number") { delete block.dataset.cobNumberGroup; delete block.dataset.cobNumberStart; delete block.dataset.cobNumberStyle; }
          if ("none" === mode) {
            marker && marker.remove();
            delete block.dataset.cobList;
            updateBlockIndent(block);
            return;
          }
          if (!marker) {
            marker = document.createElement("span");
            marker.setAttribute("data-cob-list-marker", "1");
            marker.setAttribute("contenteditable", "false");
            marker.className = "cob-list-marker";
            block.insertBefore(marker, block.firstChild);
          }
          block.dataset.cobList = mode;
          if (mode === "number" && block.dataset.cobCustomIndent === "0") block.dataset.cobCustomIndent = "36";
          if (mode === "number" && block.dataset.cobCustomFirst === "0") block.dataset.cobCustomFirst = "-36";
          marker.textContent = mode === "number" ? numberLabel(block.dataset.cobNumberStyle || "decimal", block.dataset.cobNumberStart || "1") + "\t" : "subbullet" === mode ? "◦\u00a0" : "•\u00a0";
          updateBlockIndent(block);
        }
        function applyParagraphTool(tool) {
          const blocks = selectedDraftBlocks();
          if (!blocks.length) {
            setToolsStatus("पहिले preview मा cursor राख्नुहोस् वा text छान्नुहोस्।");
            w.focus();
            return;
          }
          blocks.forEach(function (block) {
            block.dataset.docxP = "1";
            const tabLevel = Number(block.dataset.cobTab || 0);
            if ("tab-add" === tool)
              { block.dataset.cobTab = String(Math.min(6, tabLevel + 1)); if (block.dataset.cobCustomIndent !== undefined) block.dataset.cobCustomIndent = String(Math.min(216, Number(block.dataset.cobCustomIndent) + 36)); }
            else if ("tab-remove" === tool)
              { block.dataset.cobTab = String(Math.max(0, tabLevel - 1)); if (block.dataset.cobCustomIndent !== undefined) block.dataset.cobCustomIndent = String(Math.max(0, Number(block.dataset.cobCustomIndent) - 36)); }
            else if ("bullet-add" === tool) setBlockList(block, "bullet");
            else if ("bullet-remove" === tool) setBlockList(block, "none");
            else if ("subbullet-add" === tool)
              setBlockList(block, "subbullet");
            else if (
              "subbullet-remove" === tool &&
              "subbullet" === block.dataset.cobList
            )
              setBlockList(block, "bullet");
            updateBlockIndent(block);
          });
          setToolsStatus(blocks.length + " line/paragraph मा लागू भयो।");
          rememberDraftRange();
          w.dispatchEvent(new Event("input", { bubbles: !0 }));
        }
        function continueBulletOnEnter(event) {
          if (
            event.key !== "Enter" ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey
          )
            return !1;
          const selection = getSelection();
          if (!selection || !selection.rangeCount) return !1;
          const range = selection.getRangeAt(0);
          if (!range.collapsed) return !1;
          const block = draftBlockForNode(range.startContainer),
            mode = block && block.dataset.cobList;
          if (!block || !["bullet", "subbullet", "number"].includes(mode)) return !1;
          if (mode === "number") {
            const copy = block.cloneNode(true); copy.querySelectorAll("[data-cob-list-marker]").forEach(function (marker) { marker.remove(); });
            if (!copy.textContent.trim()) { event.preventDefault(); setBlockList(block, "none"); w.dispatchEvent(new Event("input", { bubbles: true })); return true; }
          }
          event.preventDefault();
          const tailRange = document.createRange();
          tailRange.selectNodeContents(block);
          tailRange.setStart(range.startContainer, range.startOffset);
          const tail = tailRange.extractContents();
          tail.querySelectorAll("[data-cob-list-marker]").forEach(function (marker) {
            marker.remove();
          });
          const next = block.cloneNode(!1);
          next.removeAttribute("id");
          next.removeAttribute("data-pe-page-before");
          next.classList.remove("cob-blank");
          next.dataset.docxP = "1";
          setBlockList(next, mode);
          const hasTail =
            r(tail.textContent) || Boolean(tail.querySelector("br,*"));
          hasTail ? next.appendChild(tail) : next.appendChild(document.createElement("br"));
          block.after(next);
          if (mode === "number") refreshNumbering();
          const marker = listMarker(next),
            caretNode = marker && marker.nextSibling,
            caret = document.createRange();
          if (caretNode && 3 === caretNode.nodeType)
            caret.setStart(caretNode, 0);
          else if (caretNode) caret.setStartBefore(caretNode);
          else caret.setStart(next, next.childNodes.length);
          caret.collapse(!0);
          selection.removeAllRanges();
          selection.addRange(caret);
          savedDraftRange = caret.cloneRange();
          setToolsStatus(
            (mode === "number" ? "Numbering" : "subbullet" === mode ? "Subbullet" : "Bullet") +
              " को नयाँ item तयार भयो।",
          );
          w.dispatchEvent(new Event("input", { bubbles: !0 }));
          return !0;
        }
        function applyPreviewFontSize(value, notify) {
          const size = Math.max(9, Math.min(24, Number(value) || 13));
          w.dataset.cobFontSize = String(size);
          w.style.fontSize = size + "pt";
          fontSizeInput.value = String(size);
          fontSizeValue.value = size + " pt";
          fontSizeValue.textContent = size + " pt";
          notify && w.dispatchEvent(new Event("input", { bubbles: !0 }));
        }
        function setToolsOpen(open) {
          toolsPanel.hidden = !open;
          toolsButton.setAttribute("aria-expanded", String(open));
          open && setToolsStatus("");
        }
        document.addEventListener("selectionchange", rememberDraftRange);
        w.addEventListener("keyup", rememberDraftRange);
        w.addEventListener("mouseup", rememberDraftRange);
        w.addEventListener("keydown", continueBulletOnEnter);
        toolsButton.addEventListener("click", function () {
          setToolsOpen(toolsPanel.hidden);
        });
        b.querySelector(".cob-tools-close").addEventListener("click", function () {
          setToolsOpen(!1);
        });
        toolsPanel.querySelectorAll("[data-cob-tool]").forEach(function (button) {
          button.addEventListener("mousedown", function (event) {
            event.preventDefault();
          });
          button.addEventListener("click", function () {
            applyParagraphTool(button.dataset.cobTool);
          });
        });
        fontSizeInput.addEventListener("input", function () {
          applyPreviewFontSize(fontSizeInput.value, !0);
        });
        applyPreviewFontSize(13, !1);
        (t.selectedJudge &&
          !R.some(function (e) {
            return c(e) === c(t.selectedJudge);
          }) &&
          R.unshift(t.selectedJudge),
          (y.innerHTML = R.map(function (e) {
            return '<option value="' + s(e) + '">' + s(e) + "</option>";
          }).join("")),
          (y.value = t.selectedJudge || R[0] || "शिवप्रसाद आचार्य"));
        const D = {
            क: "ka",
            ख: "kha",
            ग: "ga",
            घ: "gha",
            ङ: "nga",
            च: "cha",
            छ: "chha",
            ज: "ja",
            झ: "jha",
            ञ: "nya",
            ट: "tta",
            ठ: "ttha",
            ड: "dda",
            ढ: "ddha",
            ण: "nna",
            त: "ta",
            थ: "tha",
            द: "da",
            ध: "dha",
            न: "na",
            प: "pa",
            फ: "pha",
            ब: "ba",
            भ: "bha",
            म: "ma",
          },
          q = [
            "txt",
            "doc",
            "docx",
            "pdf",
            "jpg",
            "jpeg",
            "png",
            "ppt",
            "pptx",
            "xls",
            "xlsx",
          ],
          P = ["url", "link"];
        let M = null,
          I = null;
        function U(e) {
          const t = l(e).replace(/\D/g, "");
          return /^\d{8}$/.test(t) ? t : "";
        }
        function K(e) {
          const t = l(e).replace(/\D/g, "");
          return String(Number(t || 1)).padStart(2, "0");
        }
        function O(e) {
          const t = r(e).replace(/[.।\s]+/g, ""),
            n = l(t);
          return /^\d+$/.test(n) ? String(Number(n)) : D[t] || "";
        }
        function _(e) {
          const n = U(t.causeDateKey) || U(t.causeDate),
            a = K(e.benchNumber),
            o = K(e.causeListNumber),
            r = e.serialCode || O(e.serial),
            c = String(Number(e.rowNumber || 1));
          return {
            date: n,
            bench: a,
            causeList: o,
            serial: r,
            rowNumber: c,
            stem: [n, a, o, r + "-" + c].join("."),
          };
        }
        function $(e) {
          return "string" == typeof e
            ? e
            : (e &&
                "object" == typeof e &&
                (e.path || e.file || e.name || e.href || e.url)) ||
                "";
        }
        function H(e) {
          const t = new Map(),
            n = e && e.resources ? e.resources : e;
          function a(e, n) {
            const a =
              ((o = e || $(n)),
              (
                String(o || "")
                  .split(/[?#]/)[0]
                  .split(/[\\/]/)
                  .pop() || ""
              )
                .replace(
                  /\.(txt|docx?|pdf|jpe?g|png|pptx?|xlsx?|url|link)$/i,
                  "",
                )
                .toLowerCase());
            var o;
            a &&
              n &&
              (t.has(a) || t.set(a, []),
              Array.isArray(n)
                ? n.forEach(function (e) {
                    e && t.get(a).push(e);
                  })
                : t.get(a).push(n));
          }
          return (
            Array.isArray(n)
              ? n.forEach(function (e) {
                  a($(e), e);
                })
              : n &&
                "object" == typeof n &&
                Object.keys(n).forEach(function (e) {
                  const t = n[e];
                  /^\d{8}$/.test(e) && Array.isArray(t)
                    ? t.forEach(function (e) {
                        a($(e), e);
                      })
                    : a(e, t);
                }),
            t
          );
        }
        function J(e) {
          try {
            const t = new URL(String(e || "").trim());
            return /^https?:$/.test(t.protocol) ? t.href : "";
          } catch (e) {
            return "";
          }
        }
        async function B(e, n) {
          const a = J("object" == typeof e && e ? e.url || e.href : e);
          if (a)
            return { type: "url", href: a, label: r(e.label || e.title) || a };
          const o = $(e),
            c = "object" == typeof e && e ? e.name : "",
            i = (function (e, n, a) {
              let o = String(e || a || "")
                .trim()
                .replace(/\\/g, "/");
              if (!o || o.includes("..") || /^\w+:\/\//.test(o)) return "";
              o.includes("/") ||
                (o = (t.orderRoot || "order") + "/" + n + "/" + o);
              try {
                const e = new URL(o, document.baseURI),
                  a = decodeURIComponent(e.pathname),
                  r =
                    "/" +
                    String(t.orderRoot || "order")
                      .replace(/\\/g, "/")
                      .replace(/^\/+|\/+$/g, "") +
                    "/" +
                    n +
                    "/",
                  c = a.includes(r) && !a.includes("..");
                return e.origin === location.origin &&
                  /^https?:$/.test(e.protocol) &&
                  c
                  ? e.href
                  : "";
              } catch (e) {
                return "";
              }
            })(o, n.date, c);
          if (!i) return null;
          const s = new URL(i).pathname,
            l = s.match(/\.([a-z0-9]+)$/i),
            u = l ? l[1].toLowerCase() : "";
          if (P.includes(u) || "txt" === u) {
            try {
              const t = await fetch(i, { cache: "no-store" });
              if (t.ok) {
                const n = (await t.text()).trim(),
                  a = /^https?:\/\/\S+$/i.test(n) ? J(n) : "";
                if (a)
                  return {
                    type: "url",
                    href: a,
                    label: ("object" == typeof e && r(e.label || e.title)) || a,
                  };
              }
            } catch (e) {}
            if (P.includes(u)) return null;
          }
          return q.includes(u)
            ? {
                type: "file",
                href: i,
                extension: u,
                label:
                  ("object" == typeof e && r(e.label || e.title)) ||
                  decodeURIComponent(s.split("/").pop() || "आदेश"),
              }
            : null;
        }
        async function F(e) {
          const n = _(e);
          if (!n.date || !n.serial) return [];
          const a = (function (e) {
            const t = String(Number(e.bench)),
              n = String(Number(e.causeList));
            return [
              e.stem,
              [e.date, t, e.causeList, e.serial + "-" + e.rowNumber].join("."),
              [e.date, e.bench, n, e.serial + "-" + e.rowNumber].join("."),
              [e.date, t, n, e.serial + "-" + e.rowNumber].join("."),
            ].filter(function (e, t, n) {
              return e && n.indexOf(e) === t;
            });
          })(n);
          let o = await (async function () {
              return (
                M ||
                ((M = (async function () {
                  try {
                    const e = await fetch(
                      t.orderManifestPath || "order/index.json",
                      { cache: "no-store" },
                    );
                    return e.ok ? H(await e.json()) : new Map();
                  } catch (e) {
                    return new Map();
                  }
                })()),
                M)
              );
            })(),
            r = [];
          (a.forEach(function (e) {
            const t = o.get(e.toLowerCase());
            t && r.push.apply(r, t);
          }),
            r.length ||
              ((o = await (async function (e) {
                return (
                  I ||
                  ((I = (async function () {
                    try {
                      const n = location.hostname.toLowerCase();
                      if (!n.endsWith(".github.io")) return new Map();
                      const a = n.slice(0, -10),
                        o =
                          location.pathname.split("/").filter(Boolean)[0] ||
                          a + ".github.io",
                        r =
                          "https://api.github.com/repos/" +
                          encodeURIComponent(a) +
                          "/" +
                          encodeURIComponent(o) +
                          "/contents/order/" +
                          encodeURIComponent(e),
                        c = await fetch(r, {
                          headers: { Accept: "application/vnd.github+json" },
                          cache: "no-store",
                        });
                      if (!c.ok) return new Map();
                      const i = await c.json();
                      return Array.isArray(i)
                        ? H(
                            i
                              .filter(function (e) {
                                return e && "file" === e.type;
                              })
                              .map(function (n) {
                                return {
                                  name: n.name,
                                  path:
                                    (t.orderRoot || "order") +
                                    "/" +
                                    e +
                                    "/" +
                                    n.name,
                                  label: n.name,
                                };
                              }),
                          )
                        : new Map();
                    } catch (e) {
                      return new Map();
                    }
                  })()),
                  I)
                );
              })(n.date)),
              a.forEach(function (e) {
                const t = o.get(e.toLowerCase());
                t && r.push.apply(r, t);
              })));
          const c = await Promise.all(
              r.map(function (e) {
                return B(e, n);
              }),
            ),
            i = new Set();
          return c.filter(function (e) {
            return !(!e || i.has(e.href) || (i.add(e.href), 0));
          });
        }
        function z(e, t, n, a) {
          const o = document.createElement("a");
          return (
            (o.className = "cob-resource-action"),
            (o.textContent = e),
            (o.href = n),
            o.setAttribute("aria-label", t),
            (o.title = t),
            a
              ? o.setAttribute("download", "")
              : ((o.target = "_blank"), (o.rel = "noopener noreferrer")),
            o
          );
        }
        function W(e, t) {
          const n = z("👁", "फाइल हेर्नुहोस्: " + e.label, e.href, !1);
          (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(
            e.extension,
          ) &&
            n.addEventListener("click", function () {
              let e = t.querySelector(".cob-preview-note");
              (e ||
                ((e = document.createElement("span")),
                (e.className = "cob-preview-note"),
                t.appendChild(e)),
                (e.textContent =
                  "Browser preview उपलब्ध नभए फाइल डाउनलोड गर्नुहोस्।"));
            }),
            t.appendChild(n),
            t.appendChild(
              z("⇩", "फाइल डाउनलोड गर्नुहोस्: " + e.label, e.href, !0),
            ));
        }
        function Y(e, t) {
          return Number.isInteger(t) && e.cells[t]
            ? r(e.cells[t].textContent)
            : "";
        }
        const G = [];
        function Q() {
          if (!T) return;
          const e = m(T.rawCase),
            a = f(e.caseNo);
          S.innerHTML =
            "<span><b>" +
            (a ? "निवेदन नम्बर-" : "मुद्दा नम्बर-") +
            "</b> " +
            s(e.caseNo) +
            "</span><span><b>रजिष्ट्रेशन नम्बर-</b> " +
            s(e.registrationNo) +
            "</span><span><b>दायरी मिति-</b> " +
            s(d(T.date) || n) +
            "</span><span><b>फैसला/आदेश मिति-</b> " +
            s(d(t.causeDate) || n) +
            "</span><span><b>" +
            (a ? "विषय-" : "मुद्दा-") +
            "</b> " +
            s(T.subject || n) +
            "</span><span><b>अदालत-</b> " +
            s(t.court || "काठमाडौं जिल्ला अदालत") +
            "</span>";
        }
        function V(e, t) {
          const n = t || {},
            a = [];
          return (
            "center" === n.align && a.push("cob-center"),
            "left" === n.align && a.push("cob-left"),
            "right" === n.align && a.push("cob-right"),
            n.title && a.push("cob-title"),
            n.versus && a.push("cob-versus"),
            n.blank && a.push("cob-blank"),
            n.assistTitle && a.push("cob-assist-title"),
            n.firstLine && a.push("cob-first-line"),
            n.bold && a.push("cob-bold"),
            n.underline && a.push("cob-underline"),
            '<p data-docx-p="1" data-align="' +
              s(n.align || "both") +
              '" data-bold="' +
              (n.bold ? "1" : "0") +
              '" data-underline="' +
              (n.underline ? "1" : "0") +
              '" data-first-line="' +
              (n.firstLine ? "720" : "0") +
              '" class="' +
              a.join(" ") +
              '">' +
              (n.blank ? "&#160;" : s(e)) +
              "</p>"
          );
        }
        function X(e, t) {
          const a = e || n;
          return (
            '<p data-docx-p="1" data-align="left" data-bold="0" data-underline="0" data-first-line="0" data-party="1" data-party-name="' +
            s(a) +
            '" data-party-role="' +
            s(t) +
            '" class="cob-party"><span class="cob-party-name">' +
            s(a) +
            '</span><span class="cob-party-leader" aria-hidden="true"></span><span class="cob-party-role">' +
            s(t) +
            "</span></p>"
          );
        }
        function partyBlock(name, role, layout) {
          if ("stacked" !== layout) return X(name, role);
          const partyName = name || n;
          return (
            '<p data-docx-p="1" data-align="left" data-bold="0" data-underline="1" data-first-line="0" class="cob-left cob-underline cob-party-stacked-role">' +
            s(role) +
            '</p><p data-docx-p="1" data-align="left" data-bold="0" data-underline="0" data-first-line="0" data-party="1" data-party-layout="stacked" data-party-name="' +
            s(partyName) +
            '" data-party-role="' +
            s(role) +
            '" class="cob-party cob-party-stacked-name"><span class="cob-party-name">' +
            s(partyName) +
            "</span></p>"
          );
        }
        function Z() {
          reverseOptions
            .querySelectorAll("[data-reverse-mode]")
            .forEach(function (e) {
              const t = e.dataset.reverseMode === j;
              ((e.dataset.active = t ? "1" : "0"),
                e.setAttribute("aria-pressed", String(t)));
            });
        }
        function ee(e) {
          const t = document.createElement("template");
          return (
            (t.innerHTML = String(e || "")),
            t.content
              .querySelectorAll("script,style,iframe,object,embed,link,meta")
              .forEach(function (e) {
                e.remove();
              }),
            t.content.querySelectorAll("*").forEach(function (e) {
              Array.from(e.attributes).forEach(function (t) {
                (/^on/i.test(t.name) ||
                  /^(?:src|href|formaction)$/i.test(t.name)) &&
                  e.removeAttribute(t.name);
              });
            }),
            t.innerHTML
          );
        }
        function preservedMainBodyHtml() {
          const marked = w.querySelector("[data-cob-main-body='1']");
          if (marked) return ee(marked.innerHTML);
          const directElements = Array.from(w.children),
            parties = directElements.filter(function (element) {
              return element.matches(".cob-party");
            }),
            lastParty = parties[parties.length - 1];
          if (!lastParty) return "";
          let startAnchor = lastParty.nextElementSibling;
          while (startAnchor && !startAnchor.matches(".cob-blank"))
            startAnchor = startAnchor.nextElementSibling;
          let districtJudge = startAnchor && startAnchor.nextElementSibling;
          while (
            districtJudge &&
            !(
              districtJudge.matches(".cob-right") &&
              r(districtJudge.textContent) === "जिल्ला न्यायाधीश"
            )
          )
            districtJudge = districtJudge.nextElementSibling;
          if (!startAnchor || !districtJudge) return "";
          let endAnchor = districtJudge,
            previous = endAnchor.previousElementSibling;
          if (
            previous &&
            previous.matches(".cob-right") &&
            /^\(.+\)$/u.test(r(previous.textContent))
          )
            endAnchor = previous;
          previous = endAnchor.previousElementSibling;
          if (previous && previous.matches(".cob-blank")) endAnchor = previous;
          const range = document.createRange(),
            holder = document.createElement("div");
          try {
            (range.setStartAfter(startAnchor),
              range.setEndBefore(endAnchor),
              holder.appendChild(range.cloneContents()));
          } catch (error) {
            return "";
          }
          return ee(holder.innerHTML);
        }
        function te(e, t, n) {
          clearTimeout(e._cobTickTimer);
          if (!e.classList.contains("cob-icon-btn"))
            (e._cobOriginalLabel || (e._cobOriginalLabel = e.textContent),
              (e.textContent = "✓ " + t));
          (e.classList.add("cob-confirmed"),
            n &&
              (e._cobTickTimer = setTimeout(function () {
                ne(e);
              }, 1800)));
        }
        function ne(e) {
          clearTimeout(e._cobTickTimer);
          if (!e.classList.contains("cob-icon-btn") && e._cobOriginalLabel)
            e.textContent = e._cobOriginalLabel;
          e.classList.remove("cob-confirmed");
        }
        function ae() {
          ne(N);
        }
        function oe(e, preservedBody) {
          if (!T) return;
          const a = m(T.rawCase),
            o = f(a.caseNo),
            c = g.value || "आदेश",
            isCrimeSentence = "कसूर_सजाय" === c,
            i = "फैसला" === c || isCrimeSentence,
            l = d(t.causeDate),
            u = o ? "निवेदन नम्बर-" : "मुद्दा नम्बर-",
            h = y.value || t.selectedJudge || "शिवप्रसाद आचार्य",
            x = String(
              v.value || (o ? "निवेदक|विपक्षी" : "वादी|प्रतिवादी"),
            ).split("|"),
            C = x[0] || (o ? "निवेदक" : "वादी"),
            S = x[1] || (o ? "विपक्षी" : "प्रतिवादी"),
            namesReversed = "partial" === j || "full" === j,
            rolesReversed = "full" === j,
            L = namesReversed ? T.defendant : T.plaintiff,
            N = namesReversed ? T.plaintiff : T.defendant,
            E = rolesReversed ? S : C,
            k = rolesReversed ? C : S,
            versusLayout =
              "stacked" === versusSelect.value ? "stacked" : "leader",
            hasPreservedBody = "string" == typeof preservedBody,
            mainBodyHtml = hasPreservedBody
              ? ee(preservedBody)
              : (function (e, t) {
                  const a = String(
                    "यहाँ आदेश वा फैसलाको व्यहोरा लेख्नुहोस्।",
                  )
                    .replace(/\r/g, "")
                    .split("\n");
                  return a.some(function (e) {
                    return r(e);
                  })
                    ? a
                        .map(function (e) {
                          return V(r(e), {
                            blank: !r(e),
                            firstLine: t && !!r(e),
                          });
                        })
                        .join("")
                    : V(n, { firstLine: t });
                })(0, i);
          let A = "";
          const itiText = p(l),
            itiParagraph =
              '<p data-docx-p="1" data-align="left" data-bold="0" data-underline="0" data-first-line="0" data-iti="1" data-iti-text="' +
              s(itiText) +
              '" class="cob-iti"><span class="cob-iti-text">' +
              s(itiText) +
              '</span><span class="cob-iti-leader" aria-hidden="true"></span></p>';
          ((A += V("।।श्री।।", { align: "center", bold: !0 })),
            (A += V(t.court || "काठमाडौं जिल्ला अदालत", {
              align: "center",
              bold: !0,
            })),
            (A += V("इजलास", { align: "center", bold: !0 })),
            (A += V("माननीय न्यायाधीश श्री " + h, {
              align: "center",
              bold: !0,
            })),
            (A += V(c, {
              align: "center",
              bold: !0,
              underline: !0,
              title: !0,
            })),
            (A += V(u + a.caseNo, { align: "center", bold: !0 })),
            i &&
              ((A += V("रजिष्ट्रेशन नम्बर- " + a.registrationNo, {
                align: "center",
                bold: !0,
              })),
              (A += V("दायरी मिति- " + (d(T.date) || n), {
                align: "center",
                bold: !0,
              })),
              isCrimeSentence
                ? ((A += V("कसूर ठहर मिति- " + (l || n), {
                    align: "center",
                    bold: !0,
                  })),
                  (A += V("सजाय निर्धारण मिति- " + (l || n), {
                    align: "center",
                    bold: !0,
                  })),
                  (A += V("कसूर ठहर निर्णय नम्बर-", {
                    align: "center",
                    bold: !0,
                  })),
                  (A += V("सजाय निर्धारण निर्णय नम्बर-", {
                    align: "center",
                    bold: !0,
                  })))
                : ((A += V("फैसला मिति- " + (l || n), {
                    align: "center",
                    bold: !0,
                  })),
                  (A += V("निर्णय नम्बर-", {
                    align: "center",
                    bold: !0,
                  })))),
            (A += V((o ? "विषय- " : "मुद्दा- ") + (T.subject || n), {
              align: "center",
              bold: !0,
              underline: !0,
            })),
            (A += V("", { blank: !0 })),
            (A += partyBlock(L, E, versusLayout)),
            "leader" === versusLayout &&
              (A += V("विरुद्ध", { align: "center", versus: !0 })),
            (A += partyBlock(N, k, versusLayout)),
            (A += V("", { blank: !0 })),
            (A +=
              '<div class="cob-main-body" data-cob-main-body="1">' +
              mainBodyHtml +
              "</div>"),
            (A += V("", { blank: !0 })),
            i && (A += V("(" + h + ")", { align: "right" })),
            (A += V("जिल्ला न्यायाधीश", { align: "right" })),
            !i && (A += itiParagraph),
            i &&
              ((A += V("", { blank: !0 })),
              (A += V("फैसला तयार गर्न सहयोग गर्ने-", {
                align: "left",
                underline: !0,
                assistTitle: !0,
              })),
              (A += V("शाखा अधिकृत-" + preparationSuffix("branchOfficer"), { align: "left" })),
              (A += V("कम्प्युटर अपरेटर-" + preparationSuffix("computerOperator"), { align: "left" })),
              (A += V("इजलास नम्बर-" + preparationSuffix("benchNumber"), { align: "left" })),
              (A += V("फाँट-" + (T.department ? " " + T.department : ""), { align: "left" })),
              (A += itiParagraph),
              (A += V("फैसला प्रमाणीकरण मिति-", { align: "left" }))),
            (w.innerHTML = A),
            (savedDraftRange = null),
            b.querySelector("#cobDraftWrap").classList.add("cob-show"),
            !1 !== e && w.focus());
          previewEnhancer?.refresh();
          if (b.dataset.cobSyncKey) w.dispatchEvent(new Event("input", {bubbles:true}));
        }
        function preparationSuffix(key) {
          const value = r((t.preparationDetails || {})[key] || "");
          return value ? " " + value : "";
        }
        function re() {
          previewEnhancer?.close();
          closeBahas();
          closeAdesh();
          (setToolsOpen(!1),
            b.classList.remove("cob-open"),
            (document.body.style.overflow = ""),
            b.dataset.cobSyncKey &&
              document.dispatchEvent(
                new CustomEvent("cause-list:draft-close", {
                  detail: { key: b.dataset.cobSyncKey },
                }),
              ),
            delete b.dataset.cobSyncKey);
        }
        const ce = (function () {
            const e = [];
            for (let t = 0; t < 256; t += 1) {
              let n = t;
              for (let e = 0; e < 8; e += 1)
                n = 1 & n ? 3988292384 ^ (n >>> 1) : n >>> 1;
              e[t] = n >>> 0;
            }
            return e;
          })(),
          ie = function (e) {
            return new Uint8Array([255 & e, (e >>> 8) & 255]);
          },
          se = function (e) {
            return new Uint8Array([
              255 & e,
              (e >>> 8) & 255,
              (e >>> 16) & 255,
              (e >>> 24) & 255,
            ]);
          },
          le = function (e) {
            const t = new Uint8Array(
              e.reduce(function (e, t) {
                return e + t.length;
              }, 0),
            );
            let n = 0;
            return (
              e.forEach(function (e) {
                (t.set(e, n), (n += e.length));
              }),
              t
            );
          };
        function ue(e) {
          const t = new TextEncoder(),
            n = [],
            a = [];
          let o = 0;
          e.forEach(function (e) {
            const r = t.encode(e.name),
              c = t.encode(e.data),
              i = (function (e) {
                let t = 4294967295;
                for (const n of e) t = ce[255 & (t ^ n)] ^ (t >>> 8);
                return (4294967295 ^ t) >>> 0;
              })(c),
              s = le([
                se(67324752),
                ie(20),
                ie(0),
                ie(0),
                ie(0),
                ie(0),
                se(i),
                se(c.length),
                se(c.length),
                ie(r.length),
                ie(0),
                r,
                c,
              ]);
            (n.push(s),
              a.push(
                le([
                  se(33639248),
                  ie(20),
                  ie(20),
                  ie(0),
                  ie(0),
                  ie(0),
                  ie(0),
                  se(i),
                  se(c.length),
                  se(c.length),
                  ie(r.length),
                  ie(0),
                  ie(0),
                  ie(0),
                  ie(0),
                  se(0),
                  se(o),
                  r,
                ]),
              ),
              (o += s.length));
          });
          const r = le(a);
          return le(
            n.concat([
              r,
              se(101010256),
              ie(0),
              ie(0),
              ie(e.length),
              ie(e.length),
              se(r.length),
              se(o),
              ie(0),
            ]),
          );
        }
        function de(e, t, n, a) {
          const o = Math.max(18, Math.min(48, Number(a) || 26));
          return (
            '<w:r><w:rPr><w:rFonts w:ascii="Kalimati" w:hAnsi="Kalimati" w:eastAsia="Kalimati" w:cs="Kalimati"/><w:sz w:val="' +
            o +
            '"/><w:szCs w:val="' +
            o +
            '"/><w:lang w:val="ne-NP"/>' +
            (t ? "<w:b/>" : "") +
            (n ? '<w:u w:val="single"/>' : "") +
            '</w:rPr><w:t xml:space="preserve">' +
            s(e) +
            "</w:t></w:r>"
          );
        }
        function draftNodeText(e) {
          if (!e) return "";
          if (3 === e.nodeType) return e.nodeValue || "";
          if (1 !== e.nodeType) return "";
          if ("BR" === e.tagName) return "\n";
          let t = "";
          const n = new Set([
            "DIV",
            "P",
            "LI",
            "SECTION",
            "ARTICLE",
            "H1",
            "H2",
            "H3",
            "H4",
            "H5",
            "H6",
            "BLOCKQUOTE",
            "PRE",
          ]);
          return (
            Array.from(e.childNodes).forEach(function (e) {
              ((t += draftNodeText(e)),
                1 === e.nodeType &&
                  n.has(e.tagName) &&
                  !t.endsWith("\n") &&
                  (t += "\n"));
            }),
            t
          );
        }
        function wordParagraphXml(element, contentNodes) {
          const bodyParagraph = Boolean(element.closest(".cob-main-body,[data-cob-main-body='1']"));
          function colour(value) {
            const rgb = String(value).match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            return rgb ? rgb.slice(1).map(function (n) { return Number(n).toString(16).padStart(2, "0"); }).join("") : null;
          }
          function runs(node) {
            if (node.nodeType === 3) {
              const style = getComputedStyle(node.parentElement),
                size = Math.max(2, Math.min(144, parseFloat(style.fontSize) * 1.5 || 26)),
                font = style.fontFamily.split(",")[0].replace(/["']/g, ""),
                ink = colour(style.color), fill = colour(style.backgroundColor);
              let props = '<w:rFonts w:ascii="' + s(font) + '" w:hAnsi="' + s(font) + '" w:cs="' + s(font) + '"/><w:sz w:val="' + Math.round(size) + '"/><w:szCs w:val="' + Math.round(size) + '"/>';
              if (Number(style.fontWeight) >= 600 || style.fontWeight === "bold") props += "<w:b/><w:bCs/>";
              if (style.fontStyle === "italic") props += "<w:i/><w:iCs/>";
              let decorated = node.parentElement;
              while (decorated && w.contains(decorated)) {
                const line = getComputedStyle(decorated).textDecorationLine;
                if (line.includes("underline") && !props.includes("<w:u")) props += '<w:u w:val="single"/>';
                if (line.includes("line-through") && !props.includes("<w:strike")) props += "<w:strike/>";
                decorated = decorated.parentElement;
              }
              if (ink) props += '<w:color w:val="' + ink + '"/>';
              if (fill && style.backgroundColor !== "rgba(0, 0, 0, 0)") props += '<w:shd w:fill="' + fill + '"/>';
              if (style.verticalAlign === "super" || node.parentElement.closest("sup")) props += '<w:vertAlign w:val="superscript"/>';
              if (style.verticalAlign === "sub" || node.parentElement.closest("sub")) props += '<w:vertAlign w:val="subscript"/>';
              return '<w:r><w:rPr>' + props + '</w:rPr>' + String(node.nodeValue || "").replace(/\r\n?/g, "\n").replace(bodyParagraph ? /[ \t]*\n[ \t]*/g : /$^/g, " ").split(/(\t|\n)/).map(function (part) {
                return part === "\t" ? "<w:tab/>" : part === "\n" ? "<w:br/>" : '<w:t xml:space="preserve">' + s(part) + '</w:t>';
              }).join("") + '</w:r>';
            }
            if (node.nodeType !== 1) return "";
            if (node.tagName === "BR") return bodyParagraph ? '<w:r><w:t xml:space="preserve"> </w:t></w:r>' : "<w:r><w:br/></w:r>";
            if (node.matches(".cob-party-leader,.cob-iti-leader")) return "<w:r><w:tab/></w:r>";
            return Array.from(node.childNodes).map(runs).join("");
          }
          const style = getComputedStyle(element),
            align = style.textAlign === "justify" ? "both" : ["left", "right", "center"].includes(style.textAlign) ? style.textAlign : "left",
            line = Math.round((parseFloat(style.lineHeight) / parseFloat(style.fontSize) || 1.15) * 240),
            left = Math.max(0, element.dataset.cobCustomIndent !== undefined ? Math.round(Number(element.dataset.cobCustomIndent) * 20) : Number(element.dataset.docxLeft || Math.round(parseFloat(style.marginLeft) * 15) || 0)),
            right = Math.max(0, Math.round(parseFloat(style.marginRight) * 15 || 0)),
            first = Math.round(parseFloat(style.textIndent) * 15 || 0),
            pageLayout = previewEnhancer?.getLayout(),
            geometry = pageLayout && window.COBPreviewEnhancements.pageGeometry(pageLayout),
            textWidth = geometry ? geometry.width - geometry.left - geometry.right : (["फैसला","कसूर_सजाय"].includes(g.value) ? 9224 : 9638),
            customTabs = String(element.dataset.peTabs || "").split(",").map(Number).filter(function (n) { return n > 0 && n <= 720; }),
            tabs = customTabs.length ? '<w:tabs>' + customTabs.map(function (n) { return '<w:tab w:val="left" w:pos="' + Math.round(n * 20) + '"/>'; }).join("") + '</w:tabs>' : element.dataset.cobList === "number" ? '<w:tabs><w:tab w:val="left" w:pos="' + left + '"/></w:tabs>' : element.querySelector(".cob-party-leader,.cob-iti-leader") ? '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="' + textWidth + '"/></w:tabs>' : "";
          const before = Math.max(0, Math.round(parseFloat(style.marginTop) * 15 || 0)),
            after = Math.max(0, Math.round(parseFloat(style.marginBottom) * 15 || 0)),
            nodes = Array.from(contentNodes || element.childNodes);
          // A lone BR is the browser placeholder for an empty paragraph.
          // All other BRs, including consecutive/trailing breaks, are explicit.
          if (nodes.length === 1 && nodes[0].nodeName === "BR") nodes.pop();
          const keep = (element.dataset.peKeepNext === "1" ? "<w:keepNext/>" : "") + (element.dataset.peKeepLines === "1" ? "<w:keepLines/>" : "") + (element.dataset.pePageBefore === "1" ? "<w:pageBreakBefore/>" : "");
          return '<w:p><w:pPr>' + tabs + keep + '<w:jc w:val="' + align + '"/><w:spacing w:line="' + line + '" w:lineRule="auto" w:before="' + before + '" w:after="' + after + '"/><w:ind w:left="' + left + '" w:right="' + right + (first < 0 ? '" w:hanging="' + Math.abs(first) : '" w:firstLine="' + first) + '"/></w:pPr>' + nodes.map(runs).join("") + '</w:p>';
        }
        function draftDocxBlocks(root) {
          const blocks = [], blockSelector = "p,div,li,section,article,h1,h2,h3,h4,h5,h6,blockquote,pre,ul,ol";
          function emit(element, nodes) {
            blocks.push({ wordXml: wordParagraphXml(element, nodes) });
          }
          function visit(element, container) {
            let inline = [];
            const hasBlocks = Array.from(element.children).some(function (child) { return child.matches(blockSelector); });
            function flush() {
              if (!inline.length) return;
              // Ignore HTML indentation between block elements, but never trim
              // text inside a paragraph or discard an explicit empty paragraph.
              if (!hasBlocks || inline.some(function (node) { return node.nodeType === 1 || /[^\t\r\n ]/.test(node.nodeValue || ""); })) emit(element, inline);
              inline = [];
            }
            Array.from(element.childNodes).forEach(function (node) {
              if (node.nodeType === 1 && node.matches(blockSelector)) {
                flush();
                visit(node, node.matches("ul,ol,[data-cob-main-body='1']"));
              } else if (node.nodeType === 1 || node.nodeType === 3) inline.push(node);
            });
            flush();
            if (!container && !element.childNodes.length) emit(element, []);
          }
          visit(root, true);
          return blocks;
        }
        function draftState() {
          return {
            documentType:g.value, judge:y.value, partyStatus:v.value, versusLayout:versusSelect.value,
            reverseMode:j, reverse:"none" !== j, remarks:h.value, draftHtml:ee(w.innerHTML),
            bahasFormState:bahasFormState, adeshFormState:adeshFormState,
            fontSize:Number(w.dataset.cobFontSize || 13), previewLayout:previewEnhancer?.getLayout() || null
          };
        }
        const previewEnhancer = window.COBPreviewEnhancements?.attach({
          draft:w, panel:toolsPanel, backdrop:b, sanitize:ee, getState:draftState,
          rememberRange:rememberDraftRange, showTools:function () {setToolsOpen(true);},
          save:function () {N.click();}, continueNumbering:continuePreviousNumbering,
          defaultLayout:function () {return ["फैसला","कसूर_सजाय"].includes(g.value) ? {paper:"A4",orientation:"portrait",top:22.225,right:14.2875,bottom:19.05,left:33.02} : {paper:"A4",orientation:"portrait",top:20,right:20,bottom:20,left:20};},
          restoreState:function (state) {
            if (!state || typeof state.draftHtml !== "string") return;
            if (["आदेश","अन्तिम आदेश","फैसला","कसूर_सजाय"].includes(state.documentType)) g.value = state.documentType;
            if (Array.from(v.options).some(function (o) {return o.value === state.partyStatus;})) v.value = state.partyStatus;
            if (["leader","stacked"].includes(state.versusLayout)) versusSelect.value = state.versusLayout;
            j = ["none","partial","full"].includes(state.reverseMode) ? state.reverseMode : "none";
            if (state.judge && Array.from(y.options).some(function (o) {return o.value === state.judge;})) y.value = state.judge;
            bahasFormState = state.bahasFormState || null; adeshFormState = state.adeshFormState || null;
            if (A) {bahasStates.set(A,bahasFormState);adeshStates.set(A,adeshFormState);}
            w.innerHTML = ee(state.draftHtml); savedDraftRange = null; Z(); Q(); refreshNumbering(); applyPreviewFontSize(state.fontSize,false);
          }
        }) || null;
        function documentSectionXml(isDecision) {
          const layout = previewEnhancer?.getLayout();
          if (!layout) return '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>' + (isDecision ? '<w:pgMar w:top="1260" w:right="810" w:bottom="1080" w:left="1872"/>' : '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/>') + '</w:sectPr>';
          const p = window.COBPreviewEnhancements.pageGeometry(layout);
          return '<w:sectPr><w:pgSz w:w="' + p.width + '" w:h="' + p.height + (p.landscape ? '" w:orient="landscape' : '') + '"/><w:pgMar w:top="' + p.top + '" w:right="' + p.right + '" w:bottom="' + p.bottom + '" w:left="' + p.left + '"/></w:sectPr>';
        }
        (b.querySelector(".cob-close").addEventListener("click", re),
          b.addEventListener("click", function (e) {
            e.target === b && re();
          }),
          b.querySelector("#cobSave").addEventListener("click", function () {
            if (!T || !A) return;
            const e = Object.assign(draftState(), {savedAt:new Date().toISOString()});
            try {
              (localStorage.setItem(A, JSON.stringify(e)), te(N, "Saved", !1));
            } catch (e) {
              ne(N);
            }
          }),
          b.querySelector("#cobPrint").addEventListener("click", function () {
            (te(b.querySelector("#cobPrint"), "Printed", !0), window.print());
          }),
          b
            .querySelector("#cobCopy")
            .addEventListener("click", async function () {
              r(w.innerText || w.textContent) || oe(!1);
              try {
                await navigator.clipboard.writeText(
                  w.innerText || w.textContent,
                );
              } catch (e) {
                const t = document.createRange();
                (t.selectNodeContents(w),
                  getSelection().removeAllRanges(),
                  getSelection().addRange(t),
                  document.execCommand("copy"));
              }
              te(E, "Copied", !0);
            }),
          k.addEventListener("click", function () {
            if (!T) return;
            r(w.innerText || w.textContent) || oe(!1);
            const e =
                String(w.innerText || w.textContent || "")
                  .replace(/\u00a0/g, " ")
                  .replace(/\r\n?/g, "\n")
                  .trim() + "\n",
              t = new Blob(["\ufeff", e], { type: "text/plain;charset=utf-8" }),
              n = document.createElement("a"),
              a = _(T),
              o = m(T.rawCase),
              c =
                (g.value || "आदेश") +
                "-" +
                o.caseNo.replace(/[\\/:*?\"<>|]/g, "-");
            ((n.href = URL.createObjectURL(t)),
              (n.download = (a.date && a.serial ? a.stem : c) + ".txt"),
              n.click(),
              te(k, "Downloaded", !0),
              setTimeout(function () {
                URL.revokeObjectURL(n.href);
              }, 1500));
          }),
          b.querySelector("#cobDocx").addEventListener("click", function () {
            if (!T) return;
            r(w.innerText || w.textContent) || oe(!1);
            const e = "फैसला" === g.value,
              fontHalfPoints = Math.round(
                2 * Number(w.dataset.cobFontSize || 13),
              ),
              t = draftDocxBlocks(w)
                .map(function (t) {
                  if (t.wordXml) return t.wordXml;
                  return (function (e, t) {
                    const a = r(" " === e.textContent ? "" : e.textContent),
                      o =
                        "center" === e.dataset.align
                          ? "center"
                          : "right" === e.dataset.align
                            ? "right"
                            : "left" === e.dataset.align
                              ? "left"
                              : "both",
                      c = "1" === e.dataset.bold,
                      i = "1" === e.dataset.underline,
                      s = Number(e.dataset.firstLine || 0),
                      left = Math.max(0, Number(e.dataset.docxLeft || 0)),
                      indentAttributes =
                        (left > 0 ? ' w:left="' + left + '"' : "") +
                        (s > 0 ? ' w:firstLine="' + s + '"' : ""),
                      l = indentAttributes
                        ? "<w:ind" + indentAttributes + "/>"
                        : "",
                      u = "1" === e.dataset.party,
                      d = "1" === e.dataset.iti,
                      p =
                        u || d
                          ? '<w:tabs><w:tab w:val="right" w:leader="dot" w:pos="' +
                            (t ? 9224 : 9638) +
                            '"/></w:tabs>'
                          : "";
                    let m = de(a, c, i, fontHalfPoints);
                    return (
                      u
                        ? (m =
                            de(
                              e.dataset.partyName || n,
                              !1,
                              !1,
                              fontHalfPoints,
                            ) +
                            '<w:r><w:rPr><w:rFonts w:ascii="Kalimati" w:hAnsi="Kalimati" w:eastAsia="Kalimati" w:cs="Kalimati"/><w:sz w:val="' +
                            fontHalfPoints +
                            '"/><w:szCs w:val="' +
                            fontHalfPoints +
                            '"/></w:rPr><w:tab/></w:r>' +
                            de(
                              e.dataset.partyRole || "",
                              !1,
                              !1,
                              fontHalfPoints,
                            ))
                        : d &&
                          (m =
                            de(
                              e.dataset.itiText || a,
                              !1,
                              !1,
                              fontHalfPoints,
                            ) +
                            '<w:r><w:rPr><w:rFonts w:ascii="Kalimati" w:hAnsi="Kalimati" w:eastAsia="Kalimati" w:cs="Kalimati"/><w:sz w:val="' +
                            fontHalfPoints +
                            '"/><w:szCs w:val="' +
                            fontHalfPoints +
                            '"/></w:rPr><w:tab/></w:r>'),
                      "<w:p><w:pPr>" +
                        p +
                        '<w:jc w:val="' +
                        o +
                        '"/><w:spacing w:line="276" w:lineRule="auto" w:before="0" w:after="0"/>' +
                        l +
                        "</w:pPr>" +
                        m +
                        "</w:p>"
                    );
                  })(t, e);
                })
                .join(""),
              a = new Blob(
                [
                  ue([
                    {
                      name: "[Content_Types].xml",
                      data: '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/></Types>',
                    },
                    {
                      name: "_rels/.rels",
                      data: '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
                    },
                    {
                      name: "word/_rels/document.xml.rels",
                      data: '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/></Relationships>',
                    },
                    {
                      name: "word/settings.xml",
                      data: '<?xml version="1.0" encoding="UTF-8"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:compat><w:doNotExpandShiftReturn/></w:compat></w:settings>',
                    },
                    {
                      name: "word/styles.xml",
                      data:
                        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Kalimati" w:hAnsi="Kalimati" w:eastAsia="Kalimati" w:cs="Kalimati"/><w:sz w:val="' +
                        fontHalfPoints +
                        '"/><w:szCs w:val="' +
                        fontHalfPoints +
                        '"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:line="276" w:lineRule="auto" w:after="0"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style></w:styles>',
                    },
                    {
                      name: "word/document.xml",
                      data:
                        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
                        t +
                        documentSectionXml(e) +
                        "</w:body></w:document>",
                    },
                  ]),
                ],
                {
                  type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                },
              ),
              o = document.createElement("a");
            o.href = URL.createObjectURL(a);
            const c = _(T),
              i = m(T.rawCase),
              s =
                (g.value || "आदेश") +
                "-" +
                i.caseNo.replace(/[\\/:*?"<>|]/g, "-");
            ((o.download = (c.date && c.serial ? c.stem : s) + ".docx"),
              o.click(),
              te(b.querySelector("#cobDocx"), "Downloaded", !0),
              setTimeout(function () {
                URL.revokeObjectURL(o.href);
              }, 1500));
          }),
          g.addEventListener("change", function () {
            (ae(), Q(), T && oe(!1, preservedMainBodyHtml()));
          }),
          y.addEventListener("change", function () {
            (ae(), T && oe(!1, preservedMainBodyHtml()));
          }),
          v.addEventListener("change", function () {
            (ae(), T && oe(!1, preservedMainBodyHtml()));
          }),
          versusSelect.addEventListener("change", function () {
            (ae(), T && oe(!1, preservedMainBodyHtml()));
          }),
          reverseOptions.addEventListener("click", function (e) {
            const t = e.target.closest("[data-reverse-mode]");
            t &&
              reverseOptions.contains(t) &&
              t.dataset.reverseMode !== j &&
              ((j = t.dataset.reverseMode),
              Z(),
              ae(),
              T && oe(!1, preservedMainBodyHtml()));
          }),
          h.addEventListener("input", function () {
            (ae(),
              T &&
                b
                  .querySelector("#cobDraftWrap")
                  .classList.contains("cob-show") &&
                oe(!1, preservedMainBodyHtml()));
          }),
          w.addEventListener("input", ae),
          document.addEventListener("keydown", function (e) {
            "Escape" === e.key &&
              b.classList.contains("cob-open") &&
              (toolsPanel.hidden ? re() : setToolsOpen(!1));
          }),
          (function () {
            if (
              (document.querySelectorAll("table").forEach(function (e) {
                const n = (function (e) {
                  const t = Array.from(e.rows || []);
                  let n = null;
                  if (
                    (t.slice(0, 5).forEach(function (e) {
                      const t = Array.from(e.cells),
                        a = t.filter(function (e) {
                          return i(e.textContent, [
                            "कैफियत",
                            "मुद्दा",
                            "निवेदन",
                            "वादी",
                            "प्रतिवादी",
                            "विषय",
                            "दर्ता",
                          ]);
                        }).length;
                      (!n || a > n.score) &&
                        (n = { row: e, cells: t, score: a });
                    }),
                    !n || n.score < 2)
                  )
                    return null;
                  const a = {};
                  return (
                    n.cells.forEach(function (e, t) {
                      const n = r(e.textContent);
                      if (i(n, ["फाँटबाला", "फाँटवाला", "फाँट", "फाट", "फाटँ"])) a.department = t;
                      i(n, [
                        "क्र. स.",
                        "क्र.सं.",
                        "क्रम संख्या",
                        "सि.न.",
                        "सि.नं.",
                      ])
                        ? (a.serial = t)
                        : i(n, ["कैफियत", "कै."])
                          ? (a.remarks = t)
                          : i(n, ["दर्ता मिति", "दायरी मिति"])
                            ? (a.date = t)
                            : i(n, ["मुद्दा विषय", "मुद्दाको विषय", "विषय"])
                              ? (a.subject = t)
                              : i(n, ["प्रतिवादी", "विपक्षी"])
                                ? (a.defendant = t)
                                : i(n, ["वादी", "निवेदक"])
                                  ? (a.plaintiff = t)
                                  : i(n, [
                                      "मुद्दा न",
                                      "मुद्दा नं",
                                      "मुद्दा नम्बर",
                                      "निवेदन न",
                                      "निवेदन नं",
                                      "रजिष्ट्रेशन",
                                      "रजिस्ट्रेशन",
                                    ]) && (a.caseNo = t);
                    }),
                    Number.isInteger(a.remarks) && Number.isInteger(a.caseNo)
                      ? { map: a, headerRow: n.row }
                      : null
                  );
                })(e);
                if (!n) return;
                let a = "";
                const o = {};
                Array.from(e.rows).forEach(function (i) {
                  if (
                    i === n.headerRow ||
                    !i.cells[n.map.remarks] ||
                    i.querySelector(".cob-link")
                  )
                    return;
                  const s = Y(i, n.map.serial) || a,
                    l = O(s);
                  if ((Y(i, n.map.serial) && (a = Y(i, n.map.serial)), !l))
                    return;
                  o[l] = (o[l] || 0) + 1;
                  const d = {
                    rawCase: Y(i, n.map.caseNo),
                    date: Y(i, n.map.date),
                    subject: Y(i, n.map.subject),
                    plaintiff: Y(i, n.map.plaintiff),
                    defendant: Y(i, n.map.defendant),
                    remarks: Y(i, n.map.remarks),
                    department: Y(i, n.map.department),
                    serial: s,
                    serialCode: l,
                    rowNumber: o[l],
                    benchNumber: e.dataset.cobBenchNumber || "1",
                    causeListNumber: e.dataset.cobCauselistNumber || "1",
                  };
                  if (!d.rawCase) return;
                  const p = _(d);
                  p.date && p.serial && G.indexOf(p.stem) < 0 && G.push(p.stem);
                  const x = document.createElement("a");
                  ((x.href = "#"),
                    (x.className = "cob-link"),
                    (x.textContent = "आदेश बनाउनुहोस्"),
                    x.addEventListener("click", function (e) {
                      (e.preventDefault(),
                        (function (e) {
                          ((T = e),
                            (A = (function (e) {
                              const t = _(e),
                                n = c(m(e.rawCase).caseNo) || "case";
                              return (
                                "kdcwithbhas:CourtOrder:v1:" +
                                (t.date && t.serial ? t.stem : n)
                              );
                            })(e)));
                          const n = (function (e) {
                            try {
                              const t = localStorage.getItem(e);
                              return t ? JSON.parse(t) : null;
                            } catch (e) {
                              return null;
                            }
                          })(A);
                          if (
                            ((g.value = "आदेश"),
                            (y.value = t.selectedJudge || y.value),
                            (v.value = f(m(e.rawCase).caseNo)
                              ? "निवेदक|विपक्षी"
                              : "वादी|प्रतिवादी"),
                            (versusSelect.value = "leader"),
                            (j = "none"),
                            (h.value = ""),
                            n && "object" == typeof n)
                          ) {
                            if (
                              (["आदेश", "अन्तिम आदेश", "फैसला", "कसूर_सजाय"].includes(
                                n.documentType,
                              ) && (g.value = n.documentType),
                              n.judge)
                            ) {
                              if (
                                !Array.from(y.options).some(function (e) {
                                  return e.value === n.judge;
                                })
                              ) {
                                const e = document.createElement("option");
                                ((e.value = n.judge),
                                  (e.textContent = n.judge),
                                  y.appendChild(e));
                              }
                              y.value = n.judge;
                            }
                            (Array.from(v.options).some(function (e) {
                              return e.value === n.partyStatus;
                            }) && (v.value = n.partyStatus),
                              ["leader", "stacked"].includes(n.versusLayout) &&
                                (versusSelect.value = n.versusLayout),
                              (j = ["none", "partial", "full"].includes(
                                n.reverseMode,
                              )
                                ? n.reverseMode
                                : !0 === n.reverse
                                  ? "full"
                                  : "none"));
                          }
                          bahasFormState = bahasStates.get(A) || (n && n.bahasFormState) || null;
                          adeshFormState = adeshStates.get(A) || (n && n.adeshFormState) || null;
                          ((savedDraftRange = null),
                            Z(),
                            Q(),
                            b.classList.add("cob-open"),
                            (document.body.style.overflow = "hidden"),
                            oe(!1, null),
                            n && n.draftHtml && (w.innerHTML = ee(n.draftHtml)),
                            refreshNumbering(),
                            applyPreviewFontSize(
                              n && n.fontSize ? n.fontSize : 13,
                              !1,
                            ),
                            setToolsOpen(!1),
                            previewEnhancer?.open(A,n),
                            ne(E),
                            n ? te(N, "Saved", !1) : ne(N),
                            (b.dataset.cobSyncKey = A),
                            document.dispatchEvent(
                              new CustomEvent("cause-list:draft-open", {
                                detail: { key: A },
                              }),
                            ),
                            w.focus());
                        })(d));
                    }),
                    r(i.cells[n.map.remarks].textContent) &&
                      i.cells[n.map.remarks].appendChild(
                        document.createElement("br"),
                      ),
                    i.cells[n.map.remarks].appendChild(x),
                    (function (e, t) {
                      F(t)
                        .then(function (t) {
                          if (!t.length || !e.isConnected) return;
                          const n = document.createElement("span");
                          if (
                            ((n.className = "cob-resource"), 1 === t.length)
                          ) {
                            const e = t[0],
                              a = document.createElement("a");
                            ((a.className = "cob-resource-main"),
                              (a.textContent = "आदेश हेर्नुहोस्"),
                              (a.href = e.href),
                              (a.target = "_blank"),
                              (a.rel = "noopener noreferrer"),
                              a.setAttribute(
                                "aria-label",
                                "आदेश हेर्नुहोस्: " + e.label,
                              ),
                              n.appendChild(a),
                              "file" === e.type
                                ? W(e, n)
                                : n.appendChild(
                                    z(
                                      "↗",
                                      "लिङ्क खोल्नुहोस्: " + e.label,
                                      e.href,
                                      !1,
                                    ),
                                  ));
                          } else {
                            const e = document.createElement("button");
                            ((e.type = "button"),
                              (e.className = "cob-resource-main"),
                              (e.textContent =
                                "आदेश हेर्नुहोस् (" + u(t.length) + ")"),
                              e.setAttribute("aria-expanded", "false"));
                            const a = document.createElement("span");
                            ((a.className = "cob-resource-list"),
                              t.forEach(function (e) {
                                const t = document.createElement("span");
                                t.className = "cob-resource-item";
                                const n = document.createElement("span");
                                ((n.className = "cob-resource-label"),
                                  (n.textContent = e.label),
                                  t.appendChild(n),
                                  "file" === e.type
                                    ? W(e, t)
                                    : t.appendChild(
                                        z(
                                          "↗",
                                          "लिङ्क खोल्नुहोस्: " + e.label,
                                          e.href,
                                          !1,
                                        ),
                                      ),
                                  a.appendChild(t));
                              }),
                              e.addEventListener("click", function () {
                                const t = !a.classList.contains("cob-show");
                                (a.classList.toggle("cob-show", t),
                                  e.setAttribute("aria-expanded", String(t)));
                              }),
                              n.appendChild(e),
                              n.appendChild(a));
                          }
                          e.replaceWith(n);
                        })
                        .catch(function () {});
                    })(x, d));
                });
              }),
              window.parent && window.parent !== window)
            ) {
              if (!document.getElementById("cob-month-embed-style")) {
                const e = document.createElement("style");
                ((e.id = "cob-month-embed-style"),
                  (e.textContent =
                    "html,body{margin:0!important;padding:0!important;background:#fff!important}#form1{display:none!important}#wrapper,#content_wrapper,.onecolumn,#tab1{width:100%!important;max-width:none!important;margin:0!important;padding:0!important;box-shadow:none!important;border:0!important}"),
                  (document.head || document.documentElement).appendChild(e));
              }
              const e = U(t.causeDateKey) || U(t.causeDate);
              window.parent.postMessage(
                { type: "cob-month-manifest", dateKey: e, stems: G.slice() },
                "*",
              );
              const n = function () {
                const t = Math.max(
                  document.documentElement
                    ? document.documentElement.scrollHeight
                    : 0,
                  document.body ? document.body.scrollHeight : 0,
                );
                window.parent.postMessage(
                  { type: "cob-month-height", dateKey: e, height: t },
                  "*",
                );
              };
              (n(), setTimeout(n, 250), setTimeout(n, 1e3));
            }
          })());
      })(e));
  }
})();

