from flask import Flask
from flask import jsonify
app = Flask(__name__)

@app.route("/python/simulator")
def simulator():
	return jsonify(test="result")

if __name__ == "__main__":
	app.run()