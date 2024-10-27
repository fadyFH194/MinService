# MinService Web Application

MinService is a full-stack web application designed to enhance collaboration and support engagement among users. The platform allows users to create dynamic posts and tag them with relevant skills, enabling notifications to users with matching skill profiles.

## Features

- **Dynamic Post Creation:** Users can create posts with titles, content, types, and tags.
- **Skill-Based Tagging System:** Posts can be tagged with relevant skills from the database.
- **Targeted Email Notifications:** Users are notified via email when a post matches their listed skills.
- **User Management:** Secure user authentication and role-based access for administrative functionalities.
- **Collaboration:** Users can upvote posts, leave comments, and receive notifications based on their skill set.

## Tech Stack

- **Frontend:** React.js, Material-UI
- **Backend:** Python, Flask, SQLAlchemy
- **Database:** SQLite (can be extended to PostgreSQL or MySQL)
- **Email Notifications:** Gmail SMTP with OAuth2 authentication
- **Deployment:** Localhost (for development) or any WSGI-compatible server

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/MinService.git
   cd MinService
   ```

2. **Set up a virtual environment and install dependencies:**
   ```bash
   python3 -m venv myenv
   source myenv/bin/activate  # On Windows use `myenv\Scripts\activate`
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```bash
   python3 app.py
   npm run dev
   ```

## Usage

- Create an account or log in as an existing user.
- Create a post with a title, content, type (online/in-person), and tags.
- Receive email notifications if a new post matches your listed skills.
- Engage with posts by upvoting, commenting, and collaborating.

## Contributing

Feel free to open issues and submit pull requests to improve this project. Please ensure that your contributions align with the project's goals and code quality standards.

## Contact

For any queries or suggestions, reach out at fadyhanna@uni.minerva.edu.
