import './Spotify.css';

interface SpotifyCardProps {
    wide?: boolean;
    uri: string;
}

function SpotifyCard(props: SpotifyCardProps) {
    return (
        <div
            className="spotify-card-wrapper"
        >
            <iframe
                className="spotify-player"
                width={props.wide ? 550 : 300}
                height={352}
                src={`https://open.spotify.com/embed/${props.uri}`}
                allow="encrypted-media;"
                loading="lazy"
            />
        </div>
    )
}
export default SpotifyCard;
