from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)


# Use an absolute path for the feedback file so the application can
# locate it regardless of the current working directory.
FEEDBACK_FILE = (
    r"C:\Users\muste\Desktop\PROGRAMMING\CODE\Git Project Repositories - 0 to 100\Cursor-Project3\feedback.json"
)


def load_feedback():
    if os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, 'r') as f:
            return json.load(f)
    return []

def save_feedback(feedback):
    with open(FEEDBACK_FILE, 'w') as f:
        json.dump(feedback, f, indent=2)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    data = request.json
    feedback_list = load_feedback()
    feedback_list.append(data)
    save_feedback(feedback_list)
    return jsonify({"status": "success"})

@app.route('/get_feedback')
def get_feedback():
    return jsonify(load_feedback())

if __name__ == '__main__':
    app.run(debug=True) 