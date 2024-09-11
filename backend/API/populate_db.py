from .models import db, Roles, InitializationFlag


def populate_roles():
    if Roles.query.first() is None:
        user_role = Roles(name="user")
        admin_role = Roles(name="admin")
        db.session.add(user_role)
        db.session.add(admin_role)
        db.session.commit()
        print("Roles added successfully!")
    else:
        print("Roles already exist.")


def main():
    flag = InitializationFlag.query.first()
    if flag and flag.is_initialized:
        return "Initialization already done."

    populate_roles()

    if not flag:
        flag = InitializationFlag(is_initialized=True)
        db.session.add(flag)
    else:
        flag.is_initialized = True
    db.session.commit()

    return "Initialization completed."