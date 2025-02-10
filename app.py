from flask import Flask, request, jsonify, send_from_directory
import requests
import logging
import sqlite3

app = Flask(__name__, static_folder='static', static_url_path='')
logging.basicConfig(level=logging.DEBUG)

# setup database 
def init_db():
    conn = sqlite3.connect('puns_of_fun.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS jokes (id TEXT PRIMARY KEY, joke TEXT, rating INTEGER)''')
    conn.commit()
    conn.close()

init_db()

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

"""
Note to self: 
rateJoke (js) sends a POST request → 
rate_joke (py) stores joke & its rating in db → 
rate_joke (py) sends a response (success or fail) back to client.
"""
@app.route('/api/rate', methods=['POST'])
def rate_joke():
    data = request.json  # Parse JSON data from the incoming POST request
    joke_id = data['id']  
    joke_text = data['joke'] 
    rating = data['rating']  

    try:
        # store rating data in database
        conn = sqlite3.connect('puns_of_fun.db')
        c = conn.cursor()
        c.execute('INSERT OR REPLACE INTO jokes (id, joke, rating) VALUES (?, ?, ?)',
                  (joke_id, joke_text, rating))
        conn.commit()  

        app.logger.info(f"Rated joke {joke_id} with rating {rating}")
        return jsonify({'message': 'Joke rated successfully'}), 200 
    
    except sqlite3.Error as e:
        app.logger.error(f"Database error: {e}")
        return jsonify({'error': 'Failed to rate joke'}), 500  

    finally:
        conn.close()  


@app.route('/api/joke-list', methods=['GET'])
def get_joke_list():
    try:
        # retrieve the list of jokes saved in the database 
        conn = sqlite3.connect('puns_of_fun.db')
        c = conn.cursor()
        c.execute('SELECT id, joke, rating FROM jokes')
        jokes = [{'id': row[0], 'joke': row[1], 'rating': row[2]} for row in c.fetchall()]
        app.logger.info(f"Got {len(jokes)} jokes")
        return jsonify(jokes)
        
    except sqlite3.Error as e:
        app.logger.error(f"Database error: {e}")
        return jsonify({'error': 'Failed to retrieve the list of jokes'}), 500  

    finally:
        conn.close()  

if __name__ == '__main__':
    app.run(debug=True)