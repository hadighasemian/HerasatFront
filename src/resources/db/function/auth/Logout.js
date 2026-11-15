import {setAuthState} from "../../redux/authSlice";

function Logout(dispatch) {
    const auth = {
        login: {
            login: false,
            token: '',
        },
        user:
            {
                id: 1,
                name: "",
                mobile: "",
                created_at: "2023-06-15T14:40:58.000000Z",
                updated_at: "2023-06-15T14:40:58.000000Z",
                success: true,
                messages: ""
            }
    };
    dispatch(setAuthState(auth))
}
export default Logout;