(function () {
  'use strict';
  let session = null;
  let roles = ['वादी', 'प्रतिवादी'];
  let initialized = false;
  let sending = false;
  const exportButton = document.getElementById('exportBahas');
  const status = document.getElementById('bahasExportStatus');
  const originalCollect = collectFormState;
  const originalRenumber = renumberParties;

  collectFormState = function () {
    const state = originalCollect();
    document.querySelectorAll('.partyBlock').forEach((block, index) => {
      state.parties[index].governmentCounsel = !!block.querySelector('.governmentCounsel')?.checked;
      state.parties[index].previewSideIndex = Number(block.dataset.previewSideIndex || index % 2);
    });
    return state;
  };
  getFirstPartyPrefix = function () {
    return roles.some(role => /निवेदक/.test(role)) ? 'प्रस्तुत निवेदनमा' : 'प्रस्तुत मुद्दामा';
  };
  selectedGovtRole = function (block) {
    return block.querySelector('.governmentCounsel')?.checked
      ? block.querySelector('.govtRole').value : '';
  };
  renumberParties = function () {
    originalRenumber();
    if (initialized) decorateBlocks();
  };

  function decorateBlocks() {
    document.querySelectorAll('.partyBlock').forEach((block, index) => {
      const sideIndex = Number(block.dataset.previewSideIndex ?? index % 2);
      block.dataset.previewSideIndex = String(sideIndex);
      const role = roles[sideIndex] || roles[0];
      const side = ensureTarafbat(role);
      const select = block.querySelector('.partySide');
      if (![...select.options].some(option => option.value === side)) select.add(new Option(side, side));
      if (document.getElementById('styleMode').value === STYLE_MODE.DEFAULT) select.value = side;
      else {
        if (![...select.options].some(option => option.value === role)) select.add(new Option(role, role));
        select.value = role;
      }
      select.hidden = true;
      block.querySelector('.customSide').style.display = 'none';
      block.querySelector('.partyFields label').textContent = 'पक्षको हैसियत (preview बाट)';
      let roleLabel = block.querySelector('.inherited-role');
      if (!roleLabel) {
        roleLabel = document.createElement('strong');
        roleLabel.className = 'inherited-role';
        select.before(roleLabel);
      }
      roleLabel.textContent = role;
      block.querySelector('.partyTitle span:last-child').textContent = role + 'का कानून व्यवसायी';
      if (!block.querySelector('.governmentCounsel')) {
        const label = document.createElement('label');
        label.className = 'government-option';
        label.innerHTML = '<input type="checkbox" class="governmentCounsel"> सरकारी वकिल';
        roleLabel.after(label);
        label.querySelector('input').addEventListener('change', () => {
          block.querySelector('.govtRole').style.display = label.querySelector('input').checked ? 'block' : 'none';
          generate();
          sendState();
        });
      }
      block.querySelector('.govtRole').style.display = block.querySelector('.governmentCounsel').checked ? 'block' : 'none';
    });
  }
  function send(type, extra = {}) {
    if (!session) return;
    window.parent.postMessage({type, session, ...extra}, '*');
  }
  function sendState() {
    if (!initialized || sending) return;
    send('kdc-bahas-state', {state: collectFormState()});
  }
  window.addEventListener('message', event => {
    const message = event.data;
    if (event.source !== window.parent || message?.type !== 'kdc-bahas-init' || typeof message.session !== 'string') return;
    session = message.session;
    roles = Array.isArray(message.roles) && message.roles.length === 2 ? message.roles.map(String) : roles;
    sending = true;
    roles.forEach(role => {
      const side = ensureTarafbat(role);
      if (!SIDES_STYLE1.includes(side)) SIDES_STYLE1.unshift(side);
      if (!SIDES_STYLE2.includes(role)) SIDES_STYLE2.unshift(role);
    });
    const state = message.state || {
      styleMode: STYLE_MODE.DEFAULT, honorific: 'विद्वान', suffixText: 'ले गर्नुभएको बहस सुनियो।',
      includeShri: true, autoGenerate: true,
      parties: roles.map(role => ({side: ensureTarafbat(role), licences: ''})), connectors: ['तथा']
    };
    initialized = false;
    applyFormState(state, '');
    document.querySelectorAll('.partyBlock').forEach((block, index) => {
      block.dataset.previewSideIndex = String(state.parties?.[index]?.previewSideIndex ?? index % 2);
    });
    initialized = true;
    decorateBlocks();
    document.querySelectorAll('.partyBlock').forEach((block, index) => {
      block.querySelector('.governmentCounsel').checked = !!state.parties?.[index]?.governmentCounsel;
    });
    decorateBlocks();
    generate();
    sending = false;
    status.textContent = '';
    document.getElementById('bahasContext').textContent = (message.caseNo ? message.caseNo + ' · ' : '') + roles.join(' / ');
    exportButton.disabled = false;
    document.querySelector('.licenceNos')?.focus();
  });
  exportButton.addEventListener('click', () => {
    generate();
    const text = document.getElementById('outputBox').textContent.trim();
    if (!initialized || !text || document.getElementById('outputBox').querySelector('.error,.muted')) {
      status.textContent = 'पहिले कानून व्यवसायीको Licence No. वा नाम राखेर बहस तयार गर्नुहोस्।';
      return;
    }
    status.textContent = 'बहस preview मा समावेश हुँदैछ…';
    send('kdc-bahas-export', {text, state: collectFormState()});
  });
  document.getElementById('cancelBahas').addEventListener('click', () => {
    sendState(); send('kdc-bahas-close');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); sendState(); send('kdc-bahas-close'); }
  });
  ['input', 'change'].forEach(type => document.addEventListener(type, () => {
    if (!initialized) return;
    decorateBlocks();
    if (document.getElementById('autoGenerate').checked) generate();
    sendState();
  }));
  document.getElementById('clearBtn').addEventListener('click', () => {
    document.querySelectorAll('.partyBlock').forEach(block => block.remove());
    roles.forEach(role => addPartyBlock(ensureTarafbat(role), ''));
    decorateBlocks(); generate(); sendState();
  });
  document.addEventListener('DOMContentLoaded', () => send('kdc-bahas-ready'));
})();
