import HomeSection from '../components/Home/HomeSection';
import SearchGallery from '../components/Home/SearchGallery';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
    const LIMIT = 2;

    const [frames, setFrames] = useState([]);

    //Pagination states
    const [showPagination, setShowPagination] = useState(true);
    const [currentRequestCursor, setCurrentRequestCursor] = useState(null);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [cursorHistory, setCursorHistory] = useState([]);
    
    const searchHandler = async (query) => {

        //Show pagination only for the initial gallery fetch, hide it for qdrant search results
        setShowPagination(false);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/home/search`,
                {
                    text: query
                },
                {
                    withCredentials: true,
                }
            );
        
            if (response.data.galleries) {
                setFrames(response.data.galleries);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setFrames([]);
            }
        }
    };

    const nextPage = () => {
        if (!hasMore) return;

        // Save the cursor that fetched the CURRENT page
        setCursorHistory(prev => [...prev, currentRequestCursor]);

        // Fetch the NEXT page
        fetchPictures(nextCursor);
    };

    const previousPage = () => {
        if (cursorHistory.length === 0) return;

        const history = [...cursorHistory];
        const previousRequestCursor = history.pop();

        setCursorHistory(history);

        fetchPictures(previousRequestCursor);
    };

    const fetchPictures = async (requestCursor = null) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/home`,
                {
                    withCredentials: true,
                    params: {
                        cursor: requestCursor,
                        limit: LIMIT
                    }
                }
            );

            setCurrentRequestCursor(requestCursor);
            setNextCursor(response.data.nextCursor);
            setHasMore(response.data.hasMore);
            setFrames(response.data.galleries);
        } catch (error) {
            if (error.response?.status === 401) {
                setFrames([]);
            }
        }    
    };

    useEffect(() => {    
        fetchPictures();
    }, []);

    return (
        <>
            <SearchGallery onSearch={searchHandler} />
            {frames.map((item, index) => (
                <HomeSection key={index} item={item} />
            ))}
            {showPagination && (
                <div>
                    <button disabled={cursorHistory.length === 0} onClick={previousPage}>Previous</button>
                    <button disabled={!hasMore} onClick={nextPage}>Next</button>
                </div>
            )}
        </>
    );
}

export default Home;