import { BugList } from "../cmps/BugList.jsx"
import { bugService } from "../services/bug.service.js"
import { userService } from "../services/user.service.js"
const { useState, useEffect } = React

export function UserDetails() {
    const [user, setUser] = useState()
    const [userBugs, setUserBugs] = useState()

    useEffect(() => {
        const getUser = userService.getLoggedInUser()
        console.log('user:', getUser)
        setUser(getUser)
        bugService.getUserBugs(getUser._id)
            .then(setUserBugs)
            .catch(err => console.log('err:', err))
    }, [])

    console.log('userBugs:', userBugs)


    if (!user) return <div>loading...</div>
    return <section className="user-profile">
        <h1>{user.fullName} profile</h1>
        <BugList bugs={userBugs}  />

    </section>
}