import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | Dietitian Jyoti` : 'Dietitian Jyoti';
    return () => { document.title = prev; };
  }, [title]);
}
