// filepath: /Users/joshuapulido/Volumes/workplace/josh-portfolio/src/components/film/FilmList.tsx
import { useEffect, useState } from "react";
import { Carousel, Col, Container, Row, Spinner } from "react-bootstrap";
import FilmCard from "./FilmCard";
import './FilmList.css';
import { FilmData } from "../../types/FilmData";

interface FilmListProps {
  filmNames: string[];
  carousel: boolean;
}


function FilmList(props: FilmListProps) {
  const [loading, setLoading] = useState(true);
  const [filmData, setFilmData] = useState<FilmData[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);


  useEffect(() => {
    console.log("test");
    const loadFilmData = async () => {
      const data = await Promise.all(
        props.filmNames.map(async (filmName) => {
          try {
            const res = await import(`../../data/film/${filmName}.json`);
            console.log(res);
            return res.default;
          } catch {
            return null;
          }
        })
      );
      setFilmData(data.filter((item) => item !== null));
      setLoading(false);
    };

    loadFilmData();
  }, []);

  const handleSelect = (selectedIndex: number) => {
    setActiveIndex(selectedIndex);
  };

  if (loading) {
    return (
      <div className="film-list-loading">
        <Spinner animation="border" role="status" className="spinner-border">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }
  
  const grid = <Container fluid="xxl" className="film-list">
  <Row>
    {filmData.map((film, index) => (
      <Col key={index}>
        <FilmCard filmData={film} carousel={false}/>
      </Col>
    ))}
  </Row>
</Container>

const carousel =     <Carousel className="film-carousel"

activeIndex={activeIndex}
onSelect={handleSelect}>
{filmData.map((film, index) => (
  <Carousel.Item key={index}>
    <FilmCard filmData={film} carousel={true} />
  </Carousel.Item>
))}
</Carousel>

  return (
    props.carousel ? 
     carousel
     : grid
  );
}

export default FilmList;