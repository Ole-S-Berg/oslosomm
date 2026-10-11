// Språk: husk valget mellom sider, oppdater tittel og plassholdere.
(function () {
  var html = document.documentElement;
  var lagret = null;
  try { lagret = localStorage.getItem('sprak'); } catch (e) {}
  if (lagret === 'en' || lagret === 'nb') settSprak(lagret);

  function settSprak(l) {
    html.lang = l;
    var t = html.getAttribute('data-title-' + l);
    if (t) document.title = t;
    document.querySelectorAll('[data-ph-' + l + ']').forEach(function (el) {
      el.placeholder = el.getAttribute('data-ph-' + l);
    });
    var knapp = document.querySelector('.lang');
    if (knapp) knapp.setAttribute('aria-label', l === 'en' ? 'Bytt til norsk' : 'Switch to English');
    try { localStorage.setItem('sprak', l); } catch (e) {}
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('.lang')) settSprak(html.lang === 'en' ? 'nb' : 'en');
  });

  // Skjema: viser sender-tilstand, takk eller en feilmelding med e-postadressen.
  // Uten action-adresse åpnes e-postprogrammet med meldingen ferdig utfylt.
  document.querySelectorAll('form.send').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var en = html.lang === 'en';
      var knapp = form.querySelector('button');
      var status = form.parentNode.querySelector('.status');
      knapp.disabled = true;
      knapp.textContent = en ? 'Sending…' : 'Sender…';
      status.textContent = '';
      var ferdig = function (ok) {
        if (ok) {
          form.hidden = true;
          status.textContent = en ? 'Thanks! I’ll reply by email, usually within a day.' : 'Takk! Jeg svarer på e-post, som regel innen et døgn.';
        } else {
          knapp.disabled = false;
          knapp.textContent = en ? 'Try again' : 'Prøv igjen';
          status.textContent = en ? 'That didn’t go through. Try again, or email me directly at the address above.' : 'Det gikk ikke. Prøv igjen, eller send e-post direkte til adressen over.';
        }
      };
      if (!form.getAttribute('action')) {
        var melding = form.querySelector('textarea').value;
        var fra = form.querySelector('input[type=email]').value;
        var emne = en ? 'Enquiry from oslosomm.no' : 'Henvendelse fra oslosomm.no';
        location.href = 'mailto:ole@oslosomm.no?subject=' + encodeURIComponent(emne) +
          '&body=' + encodeURIComponent(melding + '\n\n' + fra);
        knapp.disabled = false;
        knapp.textContent = 'Send';
        status.textContent = en ? 'Your email app should open with the message. Press send there.' : 'E-postprogrammet ditt åpnes med meldingen. Trykk send der.';
        return;
      }
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { ferdig(r.ok); })
        .catch(function () { ferdig(false); });
    });
  });
})();
