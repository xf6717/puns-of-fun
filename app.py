from flask import Flask, jsonify, send_from_directory
import requests
import logging

app = Flask(__name__, static_folder='static', static_url_path='')
logging.basicConfig(level=logging.DEBUG)

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/new-joke', methods=['GET'])
def get_new_joke():
    try:
        response = requests.get("https://icanhazdadjoke.com/", headers={'Accept': 'application/json'})
        joke_data = response.json()
        app.logger.info(f"New joke data: {joke_data}")
        return jsonify(joke_data)
    except requests.RequestException as e: # parent class that handles all errors
        app.logger.info(f"Error fetchng new joke: {e}")
        return jsonify({'error': 'Failed to fetch new joke'}), 500

if __name__ == '__main__':
    app.run(debug=True)