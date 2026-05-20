/**
 * Al recargar (F5) una ruta de admin, el navegador pide HTML.
 * Devolvemos index.html para que Angular muestre la misma pantalla.
 * Las llamadas HttpClient (JSON) siguen yendo al backend :8181.
 */

const PANTALLAS_ADMIN = [
  '/admin',
  '/admin/usuarios',
  '/admin/datos-recuperados',
  '/admin/solicitar-info',
  '/admin/reportes/academico',
  '/admin/reportes/laboral',
  '/admin/reportes/posgrado',
  '/admin/reportes/reconocimientos'
];

function pathSinQuery(url) {
  return (url || '').split('?')[0].replace(/\/$/, '') || '/';
}

function esRecargaNavegador(req) {
  if (req.method !== 'GET') {
    return false;
  }
  if (req.headers['sec-fetch-dest'] === 'document') {
    return true;
  }
  const accept = req.headers.accept || '';
  return accept.includes('text/html') && !accept.includes('application/json');
}

function esPantallaAdmin(url) {
  const path = pathSinQuery(url);
  if (PANTALLAS_ADMIN.includes(path)) {
    return true;
  }
  return path.startsWith('/admin/reportes/');
}

const PROXY_CONFIG = {
  '/egresados': {
    target: 'http://localhost:8181',
    secure: false,
    changeOrigin: true
  },
  '/egresado': {
    target: 'http://localhost:8181',
    secure: false,
    changeOrigin: true
  },
  '/usuarios': {
    target: 'http://localhost:8181',
    secure: false,
    changeOrigin: true
  },
  '/tipo-beca': {
    target: 'http://localhost:8181',
    secure: false,
    changeOrigin: true
  },
  '/admin': {
    target: 'http://localhost:8181',
    secure: false,
    changeOrigin: true,
    bypass(req) {
      if (esRecargaNavegador(req) && esPantallaAdmin(req.url)) {
        return '/index.html';
      }
      return null;
    }
  }
};

module.exports = PROXY_CONFIG;
