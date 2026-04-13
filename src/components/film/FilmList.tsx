import { useState } from "react";
import { Carousel, Col, Container, Row } from "react-bootstrap";
import FilmCard from "./FilmCard";
import './FilmList.css';
import { PostProductionWork } from "../../types/PostProductionWork";
import { POST_PRODUCTION_WORK } from "../../data/postProductionWork";

interface FilmListProps {
  filmNames?: string[];
  carousel: boolean;
}


function FilmList(props: FilmListProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const filmData: PostProductionWork[] = props.filmNames?.length
    ? POST_PRODUCTION_WORK.filter((film) => props.filmNames?.includes(film.title))
    : POST_PRODUCTION_WORK;

  const handleSelect = (selectedIndex: number) => {
    setActiveIndex(selectedIndex);
  };
  
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
