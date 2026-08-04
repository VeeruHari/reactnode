import HomeSection from '../components/Home/HomeSection';
import SearchGallery from '../components/Home/SearchGallery';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
    const [frames, setFrames] = useState([]);

    const searchHandler = async (query) => {
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

    useEffect(() => {
        const fetchPictures = async () => {
            try {
                const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/home`,
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
    
        fetchPictures();
    }, []);

    return (
        <>
            <SearchGallery onSearch={searchHandler} />
            {frames.map((item, index) => (
                <HomeSection key={index} item={item} />
            ))}
        </>
    );
}

export default Home;