import { useState, useEffect } from "react";
import GalleryDrawer from "./GalleryDrawer";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

const GalleryPanel = () => {
  const [gallery, setGallery] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleGallerySaved = (gallery) => {
    setGallery(prev => {
        const exists = prev.some(item => item.id === gallery.id);

        if (exists) {
            // Update
            return prev.map(item =>
                item.id === gallery.id ? gallery : item
            );
        }

        // Create
        return [gallery, ...prev];
    });
  };

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/gallery`,
          {
            withCredentials: true,
          }
        );
        
        if (response.data.galleries) {
          setGallery(response.data.galleries);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          setGallery([]);
        }
      }    
    };

    fetchGallery();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this gallery item?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/admin/gallery/${id}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setGallery((prevGallery) =>
          prevGallery.filter((item) => item.id !== id)
        );

        //Reload the gallery
        //await fetchGallery();
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert(
        err.response?.data?.message || "Failed to delete gallery item."
      );
    }
  };

  const handleAdd = () => {
    setSelectedGallery(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedGallery(item);
    setIsDrawerOpen(true);
  };

  const handleClose = () => {
    setSelectedGallery(null);
    setIsDrawerOpen(false);
  };

  return (
    <>
    <aside className="right-panel">
      <div className="panel-header">
        <h2>Gallery</h2>
        <button
            className="icon-button"
            type="button"
            aria-label="Add gallery item"
            onClick={handleAdd}
          > + </button>
      </div>
      <div className="gallery-list">
        {gallery.map((item) => (
          <div key={item.id} className="gallery-item">
            <div className="gallery-thumb">
              <img src={`${import.meta.env.VITE_API_URL}/uploads/gallery/${item.image}`} alt={item.title} />
            </div>
            <div className="gallery-description">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p><b>${item.price}</b></p>
            </div>
            <div className="gallery-actions">
              <FaEdit className="action-icon edit-icon" onClick={() => handleEdit(item)} title="Edit"/>
              <FaTrash className="action-icon delete-icon" onClick={() => handleDelete(item.id)} title="Delete"/>
            </div>
          </div>
        ))}
      </div>
    </aside>
    <GalleryDrawer
      open={isDrawerOpen}
      gallery={selectedGallery}
      onClose={handleClose}
      handleAdd={handleAdd}
      gallerySaved={handleGallerySaved}
    />
    </>
  );
};

export default GalleryPanel;
