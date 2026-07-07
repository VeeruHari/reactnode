const HomeSection = ({ content, index }) => {
    return (
        <section key={index} className="card">
            <h2>{content.title}</h2>
            <p>{content.description}</p>
        </section>
    );
};

export default HomeSection;