import os
from app import create_app

env = "testing" if os.environ.get("RUNNING_BASEBALL_TESTS") == "TRUE" else "development"

app = create_app(env)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)