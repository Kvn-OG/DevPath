import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Volta ao topo ao trocar de página (exceto em links para âncoras). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}
