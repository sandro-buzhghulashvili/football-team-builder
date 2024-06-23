from flask import Flask, render_template, url_for, g, jsonify, redirect, request
import requests
import sqlite3
import json  


app = Flask(__name__)

PLAYER_DATABASE = 'fut.db'
TEAM_DATABASE = 'teams.db'

def get_db(database):
    if database == 'player':
        db = getattr(g, '_player_database', None)
        if db is None:
            db = g._player_database = sqlite3.connect(PLAYER_DATABASE)
    elif database == 'team':
        db = getattr(g, '_team_database', None)
        if db is None:
            db = g._team_database = sqlite3.connect(TEAM_DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_player_database', None)
    if db is not None:
        db.close()
    db = getattr(g, '_team_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/builder')
def builder():
    return render_template("builder.html")

@app.route('/create-team', methods=['POST'])
def create_team():
    data = request.get_json()
    team_name = data.get('name')
    team_squad = data.get('squad')
    team_squad_json = json.dumps(team_squad)


    db = get_db('team')
    cursor = db.cursor()
    cursor.execute("INSERT INTO teams (name, team) VALUES (?, ?)", (team_name, str(team_squad_json)))
    db.commit()
    cursor.close()

    return redirect(url_for("index"))

@app.route('/players/<pos>')
def players(pos):
    db = get_db('player')
    cursor = db.cursor()
    query = "SELECT * FROM players WHERE position = ?"
    cursor.execute(query, (pos,))
    players = cursor.fetchall()
    cursor.close()

    return jsonify(players)


@app.route('/teams')
def teams():
    db = get_db('team')
    cursor = db.cursor()
    cursor.execute("SELECT * FROM teams")
    teams_data = cursor.fetchall()
    cursor.close()

    teams_list = []
    for team in teams_data:
        team_id, team_name, team_squad_json = team
        team_squad = json.loads(team_squad_json)
        teams_list.append({
            'id': team_id,
            'name': team_name,
            'squad': team_squad
        })

    return render_template("teams.html", teams=teams_list)

@app.route('/teams/<int:team_id>')
def team_details(team_id):
    db = get_db('team')
    cursor = db.cursor()
    cursor.execute("SELECT * FROM teams WHERE id = ?", (team_id,))
    team = cursor.fetchone()
    cursor.close()

    if not team:
        return "Team not found", 404
    
    print(team)

    # Assuming you have a template named team_details.html
    return render_template("team_details.html", team=list(team))


@app.route('/news')
def news():
    res = requests.get("https://footballnewsapi.netlify.app/.netlify/functions/api/news/onefootball")
    data = res.json()
    return render_template("news.html", articles=data[:5])

if __name__ == "__main__":
    app.run(debug=True)
