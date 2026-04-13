import { useEffect, useState } from "react";
import { Image, Stack } from "react-bootstrap";
import { DEFAULT_FILM_DATA, FilmData } from "../../types/FilmData";
import "./FilmCard.css";

interface FilmCardProps {
  filmData?: FilmData;
  filmName?: string;
  carousel: boolean;
}

function FilmCard(props: FilmCardProps) {
  const [filmData, setFilmData] = useState<FilmData | null>(null);

  useEffect(() => {
    if (props.filmData) {
      setFilmData(props.filmData);
    }
  }, [props.filmData]);

  useEffect(() => {
    if (!props.filmData) {
      import(`../../data/film/${props.filmName}.json`)
        .then((res) => setFilmData(res.default))
        .catch((_) => setFilmData(DEFAULT_FILM_DATA));
    }
  }, [props.filmName]);

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
        <p className="film-card-year">{filmData.year}</p>
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
        <p className="film-card-year">{filmData.year}</p>
      </div>
    </Stack>
  );

  return props.carousel ? carouselVer : gridVer;
}

export default FilmCard;
