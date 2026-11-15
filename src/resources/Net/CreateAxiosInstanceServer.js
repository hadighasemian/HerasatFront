import axios from "axios";
import URLs from "./URLs";

const CreateAxiosInstanceServer = ({login}) => {
    // const navigate = useNavigate()
    // const { enqueueSnackbar } = useSnackbar();

    const instance =  axios.create({
        baseURL: URLs.base,
        timeout: Infinity,
        maxBodyLength: Infinity,
        headers: {
            // 'Access-Control-Allow-Origin': '*',
            'Authorization': 'Bearer ' + login?.token ?? '',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        }
    });
    instance.interceptors.response.use(
        (response) => response,
        (error) => Promise.reject((error.response && error.response.data) || 'Wrong Services')
    );
    // instance.interceptors.response.use(response =>{
    //     if(response?.data?.toastMessages?.length>0){
    //         ToastMessages(enqueueSnackbar,response?.data?.toastMessages)
    //     }
    //     return response
    //     }, error => {
    //         if (error.response.status === 401) {
    //             // navigate(getAddress('login'),{replace:true})
    //         }
    //         return Promise.reject(error);
    //     }
    // );
    return instance;
};

export default CreateAxiosInstanceServer;