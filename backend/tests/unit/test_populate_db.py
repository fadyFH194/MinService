# tests/unit/test_populate_db.py

import pytest
from API.populate_db import populate_roles, main
from API.models import db, Roles, InitializationFlag


@pytest.fixture
def app():
    from API import create_app

    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        }
    )
    with app.app_context():
        db.create_all()
    yield app


@pytest.fixture
def init_db(app):
    with app.app_context():
        # Ensure the database is set up and available for testing
        yield db


def test_populate_roles(init_db):
    """Test the populate_roles function to ensure roles are added correctly."""
    populate_roles()
    user_role = Roles.query.filter_by(name="user").first()
    admin_role = Roles.query.filter_by(name="admin").first()

    assert user_role is not None
    assert admin_role is not None


def test_main_function(init_db):
    """Test the main function to check the initialization flag."""
    result = main()
    assert result == "Initialization completed."

    # Check if InitializationFlag is set
    flag = InitializationFlag.query.first()
    assert flag is not None
    assert flag.is_initialized is True

    # Run main again to ensure it doesn't reset
    result = main()
    assert result == "Initialization already done."
