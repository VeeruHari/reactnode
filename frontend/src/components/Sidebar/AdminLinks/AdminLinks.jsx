const AdminLinks = ({clickHandler}) => {
    return (
        <>
            <li><a style={{ cursor: "pointer" }} onClick={() => clickHandler('gallery')}>Gallery</a></li>
        </>
    )
};

export default AdminLinks;