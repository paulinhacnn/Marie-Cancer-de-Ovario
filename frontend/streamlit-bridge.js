/* Streamlit component v1 bridge. The dashboard is expanded to its actual
 * content height so that the host browser, not a clipped iframe, can scroll.
 * ResizeObserver follows filters, maps and translated text as they rerender.
 */
(function () {
  'use strict';
  if (window.parent === window) return;
  document.documentElement.classList.add('marie-streamlit-embedded');
  const send = (type, data) => window.parent.postMessage(
    Object.assign({isStreamlitMessage: true, type: type}, data), '*'
  );
  let lastHeight = 0, pending = false;
  function measure() {
    pending = false;
    const el = document.getElementById('app');
    // Measure the actual rendered content; window.innerHeight grows as Streamlit
    // adjusts the iframe and must not be used (it causes a resize loop).
    const height = Math.max(400, Math.ceil(el?.getBoundingClientRect().height || 0) + 16);
    if (height !== lastHeight) {
      lastHeight = height;
      send('streamlit:setFrameHeight', {height});
    }
  }
  function schedule() {if (!pending) {pending = true; requestAnimationFrame(measure);}}
  function bind() {
    const el = document.getElementById('app');
    if (!el) return;
    new ResizeObserver(schedule).observe(el);
    new MutationObserver(schedule).observe(el, {childList:true,subtree:true,characterData:true});
    schedule();
  }
  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.data?.type !== 'streamlit:render') return;
    window.MARIE_HOST = event.data.args || {};
    schedule();
  });
  window.addEventListener('resize', schedule);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  send('streamlit:componentReady', {apiVersion:1});
  schedule();
})();
