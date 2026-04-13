import './Spotify.css';

interface SpotifyRowProps {
    width: string;
    // Ex: track/1KFxcj3MZrpBGiGA8ZWriv?si=f024c3aa52294aa1
    uri: string;
}

function SpotifyRow(props: SpotifyRowProps) {
    return (
        <iframe
            className="spotify-player"
            src={`https://open.spotify.com/embed/${props.uri}`}
            frameBorder={0}
            width={props.width}
            height={80}
            allow="encrypted-media;"
            loading="lazy"
        />
    );
}

export default SpotifyRow;
