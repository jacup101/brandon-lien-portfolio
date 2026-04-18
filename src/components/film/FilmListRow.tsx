import { Link } from 'react-router-dom';
import { FilmItem } from '../../data/filmWork';
import '../../pages/FilmPage.css';

const FilmListRow = ({ item, from }: { item: FilmItem; from?: string }) => (
  <Link to={`/film/${item.slug}`} state={{ from }} className="film-list-row">
    {item.imgPath && (
      <div className={`film-list-thumb${item.imgContain ? ' film-list-thumb--contain' : ''}`}>
        <img
          src={item.imgPath}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className={item.imgContain ? 'img-contain' : undefined}
        />
      </div>
    )}
    <div className="film-list-copy">
      <h2 className="film-list-title">{item.title}</h2>
      <p className="film-list-meta">
        {[item.role, item.year].filter(Boolean).join(' · ')}
      </p>
      {item.blurb && <p className="film-list-blurb">{item.blurb}</p>}
    </div>
  </Link>
);

export default FilmListRow;
