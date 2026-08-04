import os
import tempfile

from flask import Flask, request, jsonify

from search_service import SearchService

app = Flask(__name__)

search = SearchService()


@app.route("/search/text", methods=["POST"])
def text_search():

    data = request.get_json()

    text = data.get("text", "")

    result = search.search_by_text(text)

    return jsonify(result)


@app.route("/search/image", methods=["POST"])
def image_search():

    if "image" not in request.files:
        return jsonify({
            "success": False,
            "message": "No image uploaded."
        }), 400

    file = request.files["image"]

    temp_dir = tempfile.gettempdir()

    image_path = os.path.join(
        temp_dir,
        file.filename
    )

    file.save(image_path)

    result = search.search_by_image(image_path)

    os.remove(image_path)

    return jsonify(result)


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=8000,
        debug=False
    )