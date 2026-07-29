import { useState, useEffect } from "react";
import axios from 'axios';
import { toast } from "react-toastify";

const initialForm = {
  title: "",
  description: "",
  price: 0,
  stock: 0,
  image: null
};

const GalleryDrawer = ({ open, gallery, onClose, gallerySaved }) => {

  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const fetchGal = async () => {
      if (!gallery) {
        setForm(initialForm);
        setPreview(null);
        return;
      }

      setForm({
        title: gallery.title,
        description: gallery.description,
        price: gallery.price,
        stock: gallery.stock,
        image: null
      });

      setPreview(
        `${import.meta.env.VITE_API_URL}/uploads/gallery/${gallery.image}`
      );
    };

    fetchGal();
  }, [gallery]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file) {
        setPreview(URL.createObjectURL(file));
      }

      setForm(prev => ({
          ...prev,
          image: file
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("stock", form.stock);

    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      let act, response = '';
      if (gallery?.id) {
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/admin/gallery/${gallery.id}`,
          formData,
          {
            withCredentials: true,
          }
        );
        act = 'updated';
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/gallery/saveGallery`,
          formData,
          {
            withCredentials: true,
          }
        );
        act = 'created';
      }
      gallerySaved(response.data.gallery);
      toast.success("Gallery " + act + " successfully!", {position: "top-center"});
    } catch (error) {
      toast.error('Failed to create/update gallery.' + error, {position: "top-center"});
    } finally {
      //
    }

    setForm(initialForm);
    onClose();
  };

  const handleCancel = () => {
    setForm(initialForm);
    onClose();
  };

  return (
    <>
      <div className={`drawer ${open ? "open" : ""}`}>
        <div className="drawer-header">
          <h2>{gallery ? "Edit Gallery" : "Add Gallery"}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">
          <div className="">
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label>Description</label>
                <textarea
                  rows="4"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>  

              <div className="form-field">
                <label>Price</label>
                <input
                  type="text"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  name="image"
                  onChange={handleImageChange}
                />
                {preview && (
                  <img
                      src={preview}
                      alt="Preview"
                      width="200"
                  />
                )}
              </div>

              <div className="drawer-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                <button 
                  className="btn btn-primary"
                  type="submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default GalleryDrawer;