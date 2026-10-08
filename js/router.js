// Minimal hash router. Routes are registered as "/path/:param" -> async render(container, params, query).
const Router = {
  routes: [],
  register(pattern, render) {
    const paramNames = [];
    const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, (m) => {
      paramNames.push(m.slice(1));
      return '([^/?]+)';
    }) + '$');
    Router.routes.push({ regex, paramNames, render });
  },
  async resolve() {
    const raw = location.hash.slice(1) || '/';
    const [path, query] = raw.split('?');
    const cleanPath = path.replace(/\/+$/, '') || '/';
    const container = document.getElementById('app-content');
    for (const route of Router.routes) {
      const match = cleanPath.match(route.regex);
      if (!match) continue;
      const params = {};
      route.paramNames.forEach((name, i) => { params[name] = decodeURIComponent(match[i + 1]); });
      const queryObj = Util.parseQuery('?' + (query || ''));
      container.innerHTML = '';
      window.scrollTo(0, 0);
      try {
        await route.render(container, params, queryObj);
      } catch (err) {
        console.error(err);
        container.appendChild(Util.el('div', { class: 'card' }, [
          Util.el('h2', {}, 'Something went wrong'),
          Util.el('p', {}, String(err && err.message || err)),
          Util.el('button', { class: 'btn secondary', onclick: () => Util.navigate('#/') }, 'Back to Home'),
        ]));
      }
      return;
    }
    container.innerHTML = '';
    container.appendChild(Util.el('div', { class: 'card' }, [
      Util.el('h2', {}, 'Page not found'),
      Util.el('button', { class: 'btn', onclick: () => Util.navigate('#/') }, 'Back to Home'),
    ]));
  },
  start() {
    window.addEventListener('hashchange', Router.resolve);
    Router.resolve();
  },
};

window.Router = Router;
