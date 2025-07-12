import React, { useEffect } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
  const { items, fetchItems } = useData();

  // useEffect(() => {
  //   let active = true;

  //   // Intentional bug: setState called after component unmount if request is slow
  //   fetchItems().catch(console.error);

  //   // Clean‑up to avoid memory leak (candidate should implement)
  //   return () => {
  //     active = false;
  //   };
  // }, [fetchItems]);

  useEffect(() => {
    const controller = new AbortController();

    fetchItems(controller.signal).catch((err) => {
      if (err.name !== 'AbortError') console.error(err);
    });

    return () => {
      controller.abort();
    };
  }, [fetchItems]);

  if (!items.length) return <p>Loading...</p>;

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <Link to={'/items/' + item.id}>{item.name}</Link>
        </li>
      ))}
    </ul>
  );
}

export default Items;