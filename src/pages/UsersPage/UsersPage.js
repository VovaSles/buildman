import { useState, useEffect } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import NewUserModal from "../../components/NewUserModal/NewUserModal";
import UserCard from "../../components/UserCard/UserCard";
import Parse from 'parse';
import UserModel from "../../model/UserModel";
import AppNavbr from "../../components/AppNavbar/AppNavbr";



function UsersPage(props) {
    const { activeUser, onLogout } = props;
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState([]);

    //fetching users from parse
    useEffect(() => {
        async function fetchData() {
            const ParseUser = Parse.Object.extend('User');
            const query = new Parse.Query(ParseUser);
            query.equalTo("buildingId", activeUser.buildingId);
            const ParseUsers = await query.find();
            setUsers(ParseUsers.map(parseUser => new UserModel(parseUser)));
        }

        if (activeUser) {
            fetchData()
        }
    }, [activeUser])


    //adding new user
    async function addUser(username, email, apartment) {
        const ParseUser = Parse.Object.extend('User');
        const newUser = new ParseUser();

        newUser.set('username', username);
        newUser.set('email', email);
        newUser.set('password', email);
        newUser.set('apartment', apartment);
        newUser.set('buildingId', activeUser.buildingId);
        newUser.set('isAdmin', false);

        const sessionToken = Parse.User.current().get("sessionToken");
        newUser.signUp(null, {
            success: function (newUser) {
                //right now i have successfully signed up a new "student" and am actually logged in as that student
                Parse.User.become(sessionToken).then(function (newUser) {
                    // The current user is now set back to the teacher.
                    // Continue doing what you want
                }, function (error) {
                    // The token could not be validated.
                    alert('error');
                });
            },
            error: function (user, error) {
                // Show the error message somewhere and let the user try again
                alert("Error: " + error.code + " " + error.message);
            }
        });



        setUsers(users.concat(new UserModel(newUser)));
    }

    if (!activeUser) {
        return <Redirect to="/" />
    }
    //users view without admin 
    const usersView = users.filter(user => user.isAdmin === false).map(user => <Col className="m-3" key={user.id} lg={8} md={12}><UserCard key={user.id} user={user} /></Col>)

    return (
        <div>
            <AppNavbr activeUser={activeUser} onLogout={onLogout} />
            <Container className="d-flex justify-content-center align-items-center" 
            >
                
                <Row>
               
                    <Col sm={12} md={6}>
                        <div className="heading d-flex justify-content-center align-items-center">
                            {activeUser.isAdmin ? <Button  variant="warning" onClick={() => setShowModal(true)}> Add User</Button> : null}
                        </div>
                    </Col >
                    <Col sm={12} md={6}>

                        <Row>
                            {usersView.length ? usersView : "You have no users, maybe create one..."}
                        </Row>
                    </Col>
                </Row>

            </Container>
            <NewUserModal show={showModal} handleClose={() => setShowModal(false)} addUser={addUser} />
        </div>
    )
}

export default UsersPage
