'use client'
import {Button, Checkbox, Label, Spinner, TextInput} from "flowbite-react";
import Link from "next/link";
import React, {useEffect, useState} from "react";
import i18n from "@/utils/i18n";
import {useRouter} from "next/navigation";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import {useDispatch} from "react-redux";
import { useFormik} from 'formik';
import AuthModel from "@/resources/models/Auth/AuthModel";
import LogIn from "@/resources/db/function/auth/LogIn";
import URLs from "@/resources/Net/URLs";


const AuthLogin = () => {
  const router = useRouter()
  const axiosInstance = CreateAxiosInstanceServer(AuthModel());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const {login,user} = AuthModel()
  useEffect(() => {
    if (login.login) {
      // FirstMessage(axiosInstance,dispatch,user)
      router.push('/')
    }
  }, [user]);

  useEffect(()=>{
    if (data?.data?.data?.authState) {
      LogIn(dispatch,data?.data?.data?.authState)
      // ResetAllData(dispatch)
    }
  },[data])

  const validate = values => {
    const errors = {};
    const phoneRegExp = /^0\d{10}$/;

    if (values.mobile.length !== 11) {
      errors.mobile = i18n.t('Invalid phone number');
    } else if (!phoneRegExp.test(values.mobile)) {
      errors.mobile = 'Invalid phone number';
    }

    if (values.national_code.length !== 10 || !/^\d+$/.test(values.national_code)) {
      errors.national_code = 'خطا';
    }

    return errors;
  };
  const formik = useFormik({
    initialValues: {
      mobile: '',
      national_code: ''
    },
    validate,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      console.log(values)

      setLoading(true)
      const { data, loading, error } = Login(values)
      axiosInstance.post(URLs.auth.login,values).then(function (response) {
        console.log(response)
        setData(response)
      }).catch(function (error) {
        setErrors(error?.response?.data?.errors)
      }).finally(()=>{
        setLoading(false)
      });
    },
  });



  return (
    <>
      <form className="mt-6"  onSubmit={formik.handleSubmit}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="mobile" value= {i18n.t('Mobile')} />
          </div>
          <TextInput
              className="form-control"
              sizing="md"
              name='mobile'
              id='mobile'
              autoComplete='off'
              placeholder={i18n.t('Mobile')}
              value={formik.values.mobile}
              onChange={formik.handleChange}
          />
          {formik.errors.mobile ?
              <div className={'text-right pr-3 pt-2 text-red-500 text-sm'}>
                {formik.errors.mobile}
              </div> : null}
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="national_code" value={i18n.t('National Code')} />
          </div>
          <TextInput
              sizing="md"
              className="form-control"

              type="string"
              name='national_code'
              id="national_code"
              placeholder={i18n.t('National Code')}
              onChange={formik.handleChange}
          />
          {formik.errors.national_code ?
              <div className={'text-right pr-3 pt-2 text-red-500 text-sm'}>
                {formik.errors.national_code}
              </div> : null}
        </div>
        <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
            <Checkbox id="accept" className="checkbox" />
            <Label
              htmlFor="accept"
              className="opacity-90 font-normal cursor-pointer"
            >
              {i18n.t('Remember Me')}
            </Label>
          </div>
          <Link href={"/auth/auth1/forgot-password"} className="text-primary text-sm font-medium">
            {i18n.t('Forgot Password ?')}
          </Link>
        </div>
        <Button type="submit"  color={"primary"}  className="w-full">
          {loading ?
              <span>
                <Spinner aria-label="Alternate spinner button example" size="sm"/>
                <span className="px-3 ">{i18n.t('Loading...')}</span>
              </span>
              :
              i18n.t("LogIn")
          }
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
