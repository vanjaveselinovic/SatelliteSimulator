from flask import Flask
from flask import jsonify
from flask import request
app = Flask(__name__)

@app.route("/python/simulator")
def simulator():
	packetSize = request.args.get("packetSize", type=int)
	dataRate = request.args.get("packetSize", type=int)
	
	return jsonify(test="result")

if __name__ == "__main__":
	app.run()
