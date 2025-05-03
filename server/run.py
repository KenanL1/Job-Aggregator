from pydantic import BaseModel
from typing import List, Optional
from app import create_app
from pyngrok import ngrok, conf
from flask_sse import sse

# conf.get_default().auth_token = '1vMdxJHbKQbVlirHYijs78xoSP0_2mVwPLwVauPfrMWo5S1MV'
port = "5000"
app = create_app()

if __name__ == '__main__':
    # Open a ngrok tunnel to the HTTP server
    # public_url = ngrok.connect(port).public_url
    # print(f" * ngrok tunnel \"{public_url}\" -> \"http://127.0.0.1:{port}\"")

    # Update any base URLs to use the public ngrok URL
    # app.config["BASE_URL"] = public_url
    # threading.Thread(target=app.run, kwargs={"use_reloader": False}).start()
    app.register_blueprint(sse, url_prefix="/stream")

    app.run()
