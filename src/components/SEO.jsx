import { useEffect } from 'react';

/**
 * Componente SEO — actualiza <title> y meta description de cada página.
 * Uso: <SEO title="Dashboard" description="Panel de control admin" />
 */
const SEO = ({ title, description }) => {
  useEffect(() => {
    const base = 'La Milanga';
    document.title = title ? `${title} · ${base}` : base;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);

  return null; // no renderiza nada en el DOM
};

export default SEO;
