import {setAuthState} from "../../redux/authSlice";

function LogIn(dispatch,auth) {
    dispatch(setAuthState(auth))
}
export default LogIn;