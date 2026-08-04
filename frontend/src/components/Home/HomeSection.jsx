const HomeSection = ({ item }) => {
    return (
        <div key={item.id} className="gallery-item">
            <div className="gallery-thumb">
                <img src={`${import.meta.env.VITE_API_URL}/uploads/gallery/${item.image}`} alt={item.title} />
            </div>
            <div className="gallery-description">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <p><b>${item.price}</b></p>
            </div>
        </div>
    );
};

export default HomeSection;