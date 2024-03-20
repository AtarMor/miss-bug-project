const { useState } = React
const { useNavigate } = ReactRouter
const { Link, NavLink } = ReactRouterDOM

import { LoginSignup } from './LoginSignup.jsx'
import { UserMsg } from './UserMsg.jsx'

import { userService } from '../services/user.service.js'

export function AppHeader() {
  const navigate = useNavigate()

  const [user, setUser] = useState(userService.getLoggedInUser())

  function onLogout() {
      userService.logout()
          .then(()=>{
              onSetUser(null)
          })
          .catch((err) => {
              showErrorMsg('OOPs try again')
          })
  }

  function onSetUser(user) {
      setUser(user)
      navigate('/')
  }

  return (
    <header>
      <UserMsg />
      <nav>
        <NavLink to="/">Home</NavLink> |<NavLink to="/bug">Bugs</NavLink> |
        <NavLink to="/about">About</NavLink>
      </nav>
      <h1>Bugs are Forever</h1>

      {user ? (
                < section >
                    <Link to={`/user/${user._id}`}>Hello {user.fullName}</Link>
                    <button onClick={onLogout}>Logout</button>
                </ section >
            ) : (
                <section>
                    <LoginSignup onSetUser={onSetUser} />
                </section>
            )}
    </header>
  )
}
