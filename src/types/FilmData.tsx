export interface FilmData {
    title: string;
    year: string;
    imgPath: string;
}

export const DEFAULT_FILM_DATA = {
    title: "Guardians of the Galaxy",
    year: "2014",
    imgPath: "/assets/film/testfilm.png"
} as FilmData;