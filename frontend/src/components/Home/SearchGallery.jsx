import { useState } from 'react';

const SearchGallery = ({onSearch}) => {
    const [query, setQuery] = useState('');

    const handleButtonClick = () => {
        onSearch(query); 
    };

    return (
        <div className={'gallery-item'}>
            <input type="text" name="search-gallery" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className="btn btn-primary" type="submit" onClick={handleButtonClick}>Search</button>
            <button className="btn btn-secondary" type="submit" onClick={() => window.location.reload()}>Clear</button>
        </div>
    );
}

export default SearchGallery;