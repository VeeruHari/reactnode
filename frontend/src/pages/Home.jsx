import HomeSection from './HomeSection';
import contents from '../data/contents.json';

const Content = (props) => {
    return (
        <>
            {contents.map((content, index) => (
                <HomeSection content={content} index={index} />
            ))}
        </>
    );
}

export default Content;