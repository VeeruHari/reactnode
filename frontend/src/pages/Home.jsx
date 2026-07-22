import HomeSection from './HomeSection';
import contents from '../data/contents.json';

const Content = (props) => {
    return (
        <>
            {contents.map((content, index) => (
                <HomeSection key={index} content={content} />
            ))}
        </>
    );
}

export default Content;