import FilmList from '../components/film/FilmList';

const FilmsPage = () => {
  return (
    <div>
      <FilmList carousel={true} filmNames={["shades_of_trish", "el_malcriado"]}/>
      <FilmList carousel={false} filmNames={["shades_of_trish", "el_malcriado"]}/>
    </div>
  )
};

export default FilmsPage;