import { Image, Stack } from "react-bootstrap";
import { DEFAULT_POST_PRODUCTION_WORK, PostProductionWork } from "../../types/PostProductionWork";
import "./FilmCard.css";
import { POST_PRODUCTION_WORK } from "../../data/postProductionWork";

interface FilmCardProps {
  filmData?: PostProductionWork;
  filmName?: string;
  carousel: boolean;
}

function FilmCard(props: FilmCardProps) {
  const filmData =
    props.filmData ??
    POST_PRODUCTION_WORK.find((film) => film.title === props.filmName) ??
    DEFAULT_POST_PRODUCTION_WORK;

  if (!filmData) {
    return null;
  }

  const gridVer = (
    <Stack className="film-stack">
      <div className="film-image-container">
        <Image
          className="film-card-image"
          src={filmData.imgPath}
          alt={filmData.title}
        />
      </div>
      <div className="film-copy">
        <p className="film-card-title">{filmData.title}</p>
        <p className="film-card-role">{filmData.role}</p>
        <p className="film-card-year">{filmData.type}</p>
      </div>
    </Stack>
  );

  const carouselVer = (
    <Stack className="film-stack-carousel" direction="horizontal">
      <div className="film-image-poster-container">
        <Image
          className="film-card-carousel-poster"
          src={filmData.imgPath}
          alt={filmData.title}
        />
      </div>
      <div className="film-details">
        <p className="film-card-title-carousel">{filmData.title}</p>
        <p className="film-card-role">{filmData.role}</p>
        <p className="film-card-year">{filmData.type}</p>
      </div>
    </Stack>
  );

  return props.carousel ? carouselVer : gridVer;
}

export default FilmCard;
